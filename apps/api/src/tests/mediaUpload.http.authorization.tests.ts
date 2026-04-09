import { promises as fs } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

import Router from '@koa/router';
import { MediaItemStatus, MediaKind } from '@packages/contracts';
import Koa from 'koa';
import request from 'supertest';

import { buildMediaController } from '../controllers/mediaController';
import type { IocGeneratedCradle } from '../di/generated/ioc-registry.types';
import { MediaItem } from '../domain/MediaItem/MediaItem';
import type { MediaItemRepository } from '../domain/MediaItem/MediaItemRepository';
import { buildLocalMediaStorage } from '../infrastructure/media/localMediaStorage';
import { buildMediaRouter } from '../routes/mediaRouter';
import { TEST_VIEWER_A_ID, TEST_VIEWER_B_ID } from './testViewerIds';

const seedPendingItem = (id: string, ownerId: string): MediaItem =>
  MediaItem.rehydrate({
    id,
    ownerId,
    kind: MediaKind.photo,
    status: MediaItemStatus.pending,
    storageKey: `${ownerId}/photo/${id}`,
    mimeType: 'image/jpeg',
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: ownerId,
    updatedBy: ownerId,
  });

const createMediaItemRepository = (items: MediaItem[]): MediaItemRepository => {
  const byId = new Map(items.map((i) => [i.id(), i]));
  return {
    getById: async (id: string) => byId.get(id),
    save: async (item: MediaItem) => {
      byId.set(item.id(), item);
    },
  };
};

const testUserFromHeader: Koa.Middleware = async (ctx, next) => {
  const id = ctx.get('X-Authenticated-User');
  if (id) {
    ctx.state.user = {
      id,
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      isActive: true,
    };
    ctx.state.isLoggedIn = true;
    ctx.isLoggedIn = true;
  }
  await next();
};

const buildApiWithMediaUpload = (rootDir: string): http.Server => {
  const app = new Koa();
  app.use(testUserFromHeader);

  const mediaItemRepository = createMediaItemRepository([
    seedPendingItem('item-1', TEST_VIEWER_A_ID),
    seedPendingItem('item-raw-1', TEST_VIEWER_A_ID),
    seedPendingItem('item-raw-2', TEST_VIEWER_A_ID),
  ]);

  const config = {
    serverUrl: 'http://localhost:3001',
    mediaStorageRoot: path.join(rootDir, 'media'),
  };
  const mediaStorage = buildLocalMediaStorage({ config } as IocGeneratedCradle);
  const mediaController = buildMediaController({
    mediaItemRepository,
    mediaStorage,
  } as IocGeneratedCradle);
  const mediaRouter = buildMediaRouter({ mediaController } as IocGeneratedCradle);
  const api = new Router({ prefix: '/api' });
  api.use(mediaRouter.routes());
  api.use(mediaRouter.allowedMethods());
  app.use(api.routes());
  app.use(api.allowedMethods());
  return http.createServer(app.callback());
};

const jpegStub = Buffer.from([0xff, 0xd8, 0xff]);

describe('Media byte upload (HTTP)', () => {
  let previousCwd: string;
  let tempRoot: string;

  beforeAll(async () => {
    previousCwd = process.cwd();
    tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'photoapp-media-http-'));
    process.chdir(tempRoot);
  });

  afterAll(async () => {
    process.chdir(previousCwd);
    await fs.rm(tempRoot, { recursive: true, force: true });
  });

  describe('When upload requests include X-Authenticated-User (test stand-in for JWT user)', () => {
    it('should reject PUT without credentials', async () => {
      const server = buildApiWithMediaUpload(tempRoot);
      const res = await request(server)
        .put('/api/media/uploads/item-1')
        .set('Content-Type', 'image/jpeg')
        .send(jpegStub);
      expect(res.status).toBe(401);
      server.close();
    });

    it('should reject PUT when the authenticated user does not own the media item', async () => {
      const server = buildApiWithMediaUpload(tempRoot);
      const res = await request(server)
        .put('/api/media/uploads/item-1')
        .set('X-Authenticated-User', TEST_VIEWER_B_ID)
        .set('Content-Type', 'image/jpeg')
        .send(jpegStub);
      expect(res.status).toBe(403);
      server.close();
    });

    it('should store bytes when the authenticated user owns the media item', async () => {
      const server = buildApiWithMediaUpload(tempRoot);
      const res = await request(server)
        .put('/api/media/uploads/item-1')
        .set('X-Authenticated-User', TEST_VIEWER_A_ID)
        .set('Content-Type', 'image/jpeg')
        .send(jpegStub);
      expect(res.status).toBe(201);
      expect((res.body as { mediaItemId?: string; mimeType?: string }).mediaItemId).toBe('item-1');
      expect((res.body as { mimeType?: string }).mimeType).toBe('image/jpeg');
      const storedPath = path.join(tempRoot, 'media', TEST_VIEWER_A_ID, 'photo', 'item-1');
      const stat = await fs.stat(storedPath);
      expect(stat.size).toBe(jpegStub.length);
      server.close();
    });
  });

  describe('When only the production upload controller is exposed (same test auth shim)', () => {
    it('should reject unauthenticated PUT so arbitrary clients cannot write another user object', async () => {
      const server = buildApiWithMediaUpload(tempRoot);
      const res = await request(server)
        .put('/api/media/uploads/item-raw-1')
        .set('Content-Type', 'image/jpeg')
        .send(jpegStub);
      expect(res.status).toBe(401);
      server.close();
    });

    it('should reject PUT when the caller is authenticated as a different user than the media owner', async () => {
      const server = buildApiWithMediaUpload(tempRoot);
      const res = await request(server)
        .put('/api/media/uploads/item-raw-2')
        .set('X-Authenticated-User', TEST_VIEWER_B_ID)
        .set('Content-Type', 'image/jpeg')
        .send(jpegStub);
      expect(res.status).toBe(403);
      server.close();
    });
  });
});
