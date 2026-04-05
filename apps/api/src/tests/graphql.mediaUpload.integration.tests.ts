import { MediaItemStatus } from '@packages/contracts';
import type { AwilixContainer } from 'awilix';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Server } from 'node:http';
import request from 'supertest';

import type { IocGeneratedCradle } from '../di/generated/ioc-registry.types';
import { createExecuteGraphQL } from './executeGQL';
import { setupGraphqlIntegrationTests } from './graphqlIntegrationTestSetup';
import { resetIntegrationTestDb } from './resetDb';
import { TEST_VIEWER_1_ID, TEST_VIEWER_B_ID } from './testViewerIds';

const issueBearerForTestUser = (
  container: AwilixContainer<IocGeneratedCradle>,
  userId: string,
  email: string,
): string => {
  const { jwtSecret, jwtExpiresIn } = container.resolve('config');
  return jwt.sign({ userId, email, role: 'kid' }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  } as SignOptions);
};

describe('GraphQL media upload integration', () => {
  let executeGraphQL: ReturnType<typeof createExecuteGraphQL>;
  let container: AwilixContainer<IocGeneratedCradle>;
  let koaServer: Server;
  let mediaStorageRoot: string;

  beforeAll(async () => {
    const setup = await setupGraphqlIntegrationTests();
    container = setup.container;
    executeGraphQL = setup.executeGraphQL;
    koaServer = setup.container.resolve('koaServer');
    mediaStorageRoot = container.resolve('config').mediaStorageRoot;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      if (!koaServer.listening) {
        resolve();
        return;
      }
      koaServer.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });

  afterEach(async () => {
    await resetIntegrationTestDb(container.resolve('database'), mediaStorageRoot);
  });

  describe('When createMediaUpload runs for an authenticated viewer', () => {
    it('should return pending status and upload instructions', async () => {
      const { response, json } = await executeGraphQL<{
        createMediaUpload: {
          mediaItemId: string;
          status: string;
          uploadInstructions: { method: string; url: string };
        };
      }>({
        query: `
          mutation {
            createMediaUpload(input: { kind: PHOTO, mimeType: "image/jpeg" }) {
              mediaItemId
              status
              uploadInstructions {
                method
                url
              }
            }
          }
        `,
        context: { isLoggedIn: true },
      });

      expect(response.status).toBe(200);
      expect(json.errors).toBeUndefined();
      expect(json.data?.createMediaUpload.status).toBe(MediaItemStatus.pending.value);
      expect(json.data?.createMediaUpload.uploadInstructions.method).toBe('PUT');
      expect(json.data?.createMediaUpload.uploadInstructions.url).toMatch(
        /\/api\/media\/uploads\//,
      );
      expect(json.data?.createMediaUpload.mediaItemId).toBeTruthy();
    });
  });

  describe('When finalizeMediaUpload runs before the Koa upload has persisted bytes', () => {
    it('should surface a client-safe failure without an unhandled exception', async () => {
      // Real clients: createMediaUpload → PUT /api/media/uploads/:mediaItemId (multipart) → finalizeMediaUpload.
      // This scenario skips the HTTP upload so storage has no object yet.
      const created = await executeGraphQL<{ createMediaUpload: { mediaItemId: string } }>({
        query: `
          mutation {
            createMediaUpload(input: { kind: PHOTO, mimeType: "image/jpeg" }) {
              mediaItemId
            }
          }
        `,
        context: { isLoggedIn: true },
      });
      expect(created.json.errors).toBeUndefined();
      const mediaItemId = created.json.data?.createMediaUpload.mediaItemId;
      expect(mediaItemId).toBeTruthy();
      if (!mediaItemId) {
        return;
      }

      const { response, json } = await executeGraphQL<{
        finalizeMediaUpload?: { mediaItemId: string; status: string; size: number };
      }>({
        query: `
          mutation ($id: ID!) {
            finalizeMediaUpload(input: { mediaItemId: $id }) {
              mediaItemId
              status
              size
            }
          }
        `,
        variables: { id: mediaItemId },
        context: { isLoggedIn: true },
      });

      expect(response.status).toBe(200);
      expect(json.data?.finalizeMediaUpload).toBeFalsy();
      expect(json.errors?.length).toBeGreaterThan(0);
      expect(json.errors?.[0]?.message).toBe('Media bytes not found');
      expect(json.errors?.[0]?.extensions?.code).toBe('MEDIA_BYTES_NOT_FOUND');
    });
  });

  describe('When the viewer uploads bytes via the Koa API then calls finalizeMediaUpload', () => {
    it('should transition the media item to ready', async () => {
      const token = issueBearerForTestUser(
        container,
        TEST_VIEWER_1_ID,
        'test-viewer-1@example.test',
      );

      const created = await executeGraphQL<{ createMediaUpload: { mediaItemId: string } }>({
        query: `
          mutation {
            createMediaUpload(input: { kind: PHOTO, mimeType: "image/jpeg" }) {
              mediaItemId
            }
          }
        `,
        context: { isLoggedIn: true },
      });
      expect(created.json.errors).toBeUndefined();
      const mediaItemId = created.json.data?.createMediaUpload.mediaItemId;
      expect(mediaItemId).toBeTruthy();
      if (!mediaItemId) {
        return;
      }

      const uploadRes = await request(koaServer)
        .put(`/api/media/uploads/${mediaItemId}`)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from([0xff, 0xd8, 0xff]), {
          filename: 'x.jpg',
          contentType: 'image/jpeg',
        });
      expect(uploadRes.status).toBe(201);

      const { response, json } = await executeGraphQL<{
        finalizeMediaUpload: { mediaItemId: string; status: string; size: number };
      }>({
        query: `
          mutation ($id: ID!) {
            finalizeMediaUpload(input: { mediaItemId: $id }) {
              mediaItemId
              status
              size
            }
          }
        `,
        variables: { id: mediaItemId },
        context: { isLoggedIn: true },
      });

      expect(response.status).toBe(200);
      expect(json.errors).toBeUndefined();
      expect(json.data?.finalizeMediaUpload.mediaItemId).toBe(mediaItemId);
      expect(json.data?.finalizeMediaUpload.status).toBe(MediaItemStatus.ready.value);
      expect(json.data?.finalizeMediaUpload.size).toBeGreaterThan(0);
    });
  });

  describe('When finalizeMediaUpload is invoked by a different viewer than the owner', () => {
    it('should fail without transitioning the media item for the attacker', async () => {
      const created = await executeGraphQL<{ createMediaUpload: { mediaItemId: string } }>({
        query: `
          mutation {
            createMediaUpload(input: { kind: PHOTO, mimeType: "image/jpeg" }) {
              mediaItemId
            }
          }
        `,
        context: { isLoggedIn: true },
      });
      expect(created.json.errors).toBeUndefined();
      const mediaItemId = created.json.data?.createMediaUpload.mediaItemId;
      if (!mediaItemId) {
        return;
      }

      const { json } = await executeGraphQL<{
        finalizeMediaUpload?: { mediaItemId: string; status: string };
      }>({
        query: `
          mutation ($id: ID!) {
            finalizeMediaUpload(input: { mediaItemId: $id }) {
              mediaItemId
              status
            }
          }
        `,
        variables: { id: mediaItemId },
        context: {
          isLoggedIn: true,
          user: {
            id: TEST_VIEWER_B_ID,
            firstName: 'B',
            lastName: 'B',
            email: 'b@example.com',
          },
        },
      });

      expect(json.data?.finalizeMediaUpload).toBeFalsy();
      expect(json.errors?.[0]?.message).toBeTruthy();
    });
  });
});
