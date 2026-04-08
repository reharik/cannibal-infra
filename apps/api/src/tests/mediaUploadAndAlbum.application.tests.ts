import { AppErrorCollection, MediaItemStatus, MediaKind } from '@packages/contracts';
import type { MediaStorage } from '../application/media/MediaStorage';
import { buildAddAlbumItem } from '../application/writeServices/album/addAlbumItem';
import { buildCreateAlbum } from '../application/writeServices/album/createAlbum';
import { buildCreateMediaItemUpload } from '../application/writeServices/mediaItem/createMediaItemUpload';
import { buildFinalizeMediaItemUpload } from '../application/writeServices/mediaItem/finalizeMediaItemUpload';
import { Album } from '../domain/Album/Album';
import type { AlbumRepository } from '../domain/Album/AlbumRepository';
import { MediaItem } from '../domain/MediaItem/MediaItem';
import type { MediaItemRepository } from '../domain/MediaItem/MediaItemRepository';
import { MediaItemProjection } from '../application/readServices/viewerReadServices/viewerMediaItemReadService.types';
import { EntityId } from '../types/types';
import { TEST_VIEWER_A_ID, TEST_VIEWER_B_ID } from './testViewerIds';

type ObjectState = { size: number; mimeType?: string };

const createInMemoryMediaItemRepository = (): MediaItemRepository => {
  const byId = new Map<string, MediaItem>();
  return {
    getById: async (id: string) => byId.get(id),
    save: async (item: MediaItem) => {
      byId.set(item.id(), item);
    },
  };
};

const createInMemoryAlbumRepository = (): AlbumRepository => {
  const byId = new Map<string, Album>();
  return {
    getById: async (id: string) => byId.get(id),
    save: async (album: Album) => {
      byId.set(album.id(), album);
    },
  };
};

const createTrackingMediaStorage = (
  serverUrl: string,
): MediaStorage & { objects: Map<string, ObjectState> } => {
  const objects = new Map<string, ObjectState>();
  return {
    objects,
    getUploadTarget: async ({ mediaItemId, mimeType }) => ({
      method: 'PUT' as const,
      url: `${serverUrl}/api/media/uploads/${mediaItemId}?mimeType=${encodeURIComponent(mimeType)}`,
      headers: {},
    }),
    writeUploadedFile: async () => {
      // Application tests record storage state via `objects` when simulating uploaded bytes.
    },
    getObjectMetadata: async (storageKey: string) => {
      const o = objects.get(storageKey);
      return o ?? null;
    },
    verifyExistence: async (storageKey: string) => objects.has(storageKey),
  };
};

const projectionFromAggregate = (item: MediaItem): MediaItemProjection => {
  const p = item.toPersistence();
  return {
    id: item.id(),
    ownerId: item.ownerId(),
    kind: item.kind().value,
    status: item.status().value,
    storageKey: item.storageKey(),
    mimeType: p.mimeType,
    sizeBytes: p.sizeBytes ?? 0,
    width: p.width,
    height: p.height,
    title: p.title,
    description: p.description,
    takenAt: p.takenAt,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
};

describe('Media upload pipeline (application services)', () => {
  const viewerA = TEST_VIEWER_A_ID;
  const viewerB = TEST_VIEWER_B_ID;
  const serverUrl = 'http://localhost:3999';

  describe('When createMediaUpload runs', () => {
    it('should persist a pending media item and return upload instructions', async () => {
      const mediaItemRepository = createInMemoryMediaItemRepository();
      const mediaStorage = createTrackingMediaStorage(serverUrl);
      const createUpload = buildCreateMediaItemUpload({
        mediaItemRepository,
        mediaStorage,
      } as never);

      const result = await createUpload({
        viewerId: viewerA,
        kind: MediaKind.photo,
        mimeType: 'image/jpeg',
      });

      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }
      expect(result.value.status).toBe(MediaItemStatus.pending);
      expect(result.value.uploadTarget.method).toBe('PUT');
      expect(result.value.uploadTarget.url).toContain('/api/media/');

      const stored = await mediaItemRepository.getById(result.value.mediaItemId);
      expect(stored).toBeDefined();
      expect(stored?.status()).toBe(MediaItemStatus.pending);
    });
  });

  describe('When bytes are recorded in storage then finalize runs', () => {
    it('should transition the item to ready and return confirmed size and mime type', async () => {
      const mediaItemRepository = createInMemoryMediaItemRepository();
      const mediaStorage = createTrackingMediaStorage(serverUrl);
      const createUpload = buildCreateMediaItemUpload({
        mediaItemRepository,
        mediaStorage,
      } as never);
      const finalize = buildFinalizeMediaItemUpload({
        mediaItemRepository,
        mediaStorage,
      } as never);

      const created = await createUpload({
        viewerId: viewerA,
        kind: MediaKind.photo,
        mimeType: 'image/jpeg',
      });
      expect(created.success).toBe(true);
      if (!created.success) {
        return;
      }
      const item = await mediaItemRepository.getById(created.value.mediaItemId);
      expect(item).toBeDefined();
      if (!item) {
        return;
      }
      const key = item.storageKey();
      mediaStorage.objects.set(key, { size: 2048, mimeType: 'image/jpeg' });

      const finalized = await finalize({
        viewerId: viewerA,
        mediaItemId: created.value.mediaItemId,
      });
      expect(finalized.success).toBe(true);
      if (!finalized.success) {
        return;
      }
      expect(finalized.value.status).toBe(MediaItemStatus.ready);
      expect(finalized.value.size).toBe(2048);
      expect(finalized.value.mimeType).toBe('image/jpeg');

      const after = await mediaItemRepository.getById(created.value.mediaItemId);
      expect(after?.status()).toBe(MediaItemStatus.ready);
    });
  });

  describe('When finalize runs before any object exists in storage', () => {
    it('should fail and leave the media item pending', async () => {
      const mediaItemRepository = createInMemoryMediaItemRepository();
      const mediaStorage = createTrackingMediaStorage(serverUrl);
      const createUpload = buildCreateMediaItemUpload({
        mediaItemRepository,
        mediaStorage,
      } as never);
      const finalize = buildFinalizeMediaItemUpload({
        mediaItemRepository,
        mediaStorage,
      } as never);

      const created = await createUpload({
        viewerId: viewerA,
        kind: MediaKind.photo,
        mimeType: 'image/jpeg',
      });
      expect(created.success).toBe(true);
      if (!created.success) {
        return;
      }

      const finalized = await finalize({
        viewerId: viewerA,
        mediaItemId: created.value.mediaItemId,
      });
      expect(finalized.success).toBe(false);

      const after = await mediaItemRepository.getById(created.value.mediaItemId);
      expect(after?.status()).toBe(MediaItemStatus.pending);
    });
  });

  describe('When a different viewer tries to finalize another user media', () => {
    it('should fail with not owned by viewer', async () => {
      const mediaItemRepository = createInMemoryMediaItemRepository();
      const mediaStorage = createTrackingMediaStorage(serverUrl);
      const createUpload = buildCreateMediaItemUpload({
        mediaItemRepository,
        mediaStorage,
      } as never);
      const finalize = buildFinalizeMediaItemUpload({
        mediaItemRepository,
        mediaStorage,
      } as never);

      const created = await createUpload({
        viewerId: viewerA,
        kind: MediaKind.photo,
        mimeType: 'image/jpeg',
      });
      expect(created.success).toBe(true);
      if (!created.success) {
        return;
      }
      const item = await mediaItemRepository.getById(created.value.mediaItemId);
      if (!item) {
        return;
      }
      mediaStorage.objects.set(item.storageKey(), { size: 10, mimeType: 'image/jpeg' });

      const finalized = await finalize({
        viewerId: viewerB,
        mediaItemId: created.value.mediaItemId,
      });
      expect(finalized.success).toBe(false);
      let code = '';
      if (!finalized.success) {
        code = finalized.error.code;
      }
      expect(code).toBe(AppErrorCollection.mediaItem.MediaItemNotOwnedByViewer.code);
    });
  });
});

describe('Album integration (application services)', () => {
  const viewerId = TEST_VIEWER_A_ID;

  describe('When createAlbum runs', () => {
    it('should persist a new album and return its id', async () => {
      const albumRepository = createInMemoryAlbumRepository();
      const createAlbum = buildCreateAlbum({ albumRepository } as never);
      const result = await createAlbum({ viewerId, title: 'Summer' });
      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }
      const loaded = await albumRepository.getById(result.value.albumId);
      expect(loaded).toBeDefined();
    });
  });

  describe('When addAlbumItem is called for pending media', () => {
    it('should fail with media not ready', async () => {
      const albumRepository = createInMemoryAlbumRepository();
      const mediaItemRepository = createInMemoryMediaItemRepository();
      const projectionFromReadRepo = new Map<string, MediaItemProjection>();

      const createAlbum = buildCreateAlbum({ albumRepository } as never);
      const albumResult = await createAlbum({ viewerId, title: 'Summer' });
      expect(albumResult.success).toBe(true);
      if (!albumResult.success) {
        return;
      }

      const createUpload = buildCreateMediaItemUpload({
        mediaItemRepository,
        mediaStorage: createTrackingMediaStorage('http://localhost:0'),
      } as never);
      const mediaResult = await createUpload({
        viewerId,
        kind: MediaKind.photo,
        mimeType: 'image/jpeg',
      });
      expect(mediaResult.success).toBe(true);
      if (!mediaResult.success) {
        return;
      }
      const item = await mediaItemRepository.getById(mediaResult.value.mediaItemId);
      if (!item) {
        return;
      }
      projectionFromReadRepo.set(item.id(), projectionFromAggregate(item));

      const addAlbumItem = buildAddAlbumItem({
        albumRepository,
        mediaItemReadRepository: {
          getForViewer: async ({ mediaItemId }: { mediaItemId: EntityId }) =>
            projectionFromReadRepo.get(mediaItemId),
        },
      } as never);

      const add = await addAlbumItem({
        viewerId,
        albumId: albumResult.value.albumId,
        mediaItemId: item.id(),
      });
      expect(add.success).toBe(false);
      let code = '';
      if (!add.success) {
        code = add.error.code;
      }
      expect(code).toBe(AppErrorCollection.mediaItem.MediaItemNotReady.code);
    });
  });

  describe('When addAlbumItem is called for ready media', () => {
    it('should persist the album item', async () => {
      const albumRepository = createInMemoryAlbumRepository();
      const mediaItemRepository = createInMemoryMediaItemRepository();
      const projectionFromReadRepo = new Map<string, MediaItemProjection>();
      const mediaStorage = createTrackingMediaStorage('http://localhost:0');

      const createAlbum = buildCreateAlbum({ albumRepository } as never);
      const albumResult = await createAlbum({ viewerId, title: 'Summer' });
      expect(albumResult.success).toBe(true);
      if (!albumResult.success) {
        return;
      }

      const createUpload = buildCreateMediaItemUpload({
        mediaItemRepository,
        mediaStorage,
      } as never);
      const finalize = buildFinalizeMediaItemUpload({
        mediaItemRepository,
        mediaStorage,
      } as never);

      const mediaResult = await createUpload({
        viewerId,
        kind: MediaKind.photo,
        mimeType: 'image/jpeg',
      });
      expect(mediaResult.success).toBe(true);
      if (!mediaResult.success) {
        return;
      }
      const item = await mediaItemRepository.getById(mediaResult.value.mediaItemId);
      if (!item) {
        return;
      }
      mediaStorage.objects.set(item.storageKey(), { size: 100, mimeType: 'image/jpeg' });
      const fin = await finalize({ viewerId, mediaItemId: item.id() });
      expect(fin.success).toBe(true);
      if (!fin.success) {
        return;
      }
      const readyItem = await mediaItemRepository.getById(item.id());
      if (!readyItem) {
        return;
      }
      projectionFromReadRepo.set(readyItem.id(), projectionFromAggregate(readyItem));

      const addAlbumItem = buildAddAlbumItem({
        albumRepository,
        mediaItemReadRepository: {
          // eslint-disable-next-line @typescript-eslint/require-await
          getForViewer: async ({ mediaItemId }: { mediaItemId: EntityId }) =>
            projectionFromReadRepo.get(mediaItemId),
        },
      } as never);

      const add = await addAlbumItem({
        viewerId,
        albumId: albumResult.value.albumId,
        mediaItemId: readyItem.id(),
      });
      expect(add.success).toBe(true);
      if (!add.success) {
        return;
      }

      const album = await albumRepository.getById(albumResult.value.albumId);
      const persisted = album?.toPersistence();
      expect(persisted?.items?.length).toBe(1);
    });
  });

  describe('When addAlbumItem is called twice for the same media', () => {
    it('should reject the duplicate when the aggregate disallows it', async () => {
      const albumRepository = createInMemoryAlbumRepository();
      const mediaItemRepository = createInMemoryMediaItemRepository();
      const projectionFromReadRepo = new Map<string, MediaItemProjection>();
      const mediaStorage = createTrackingMediaStorage('http://localhost:0');

      const createAlbum = buildCreateAlbum({ albumRepository } as never);
      const albumResult = await createAlbum({ viewerId, title: 'Summer' });
      expect(albumResult.success).toBe(true);
      if (!albumResult.success) {
        return;
      }

      const createUpload = buildCreateMediaItemUpload({
        mediaItemRepository,
        mediaStorage,
      } as never);
      const finalize = buildFinalizeMediaItemUpload({
        mediaItemRepository,
        mediaStorage,
      } as never);

      const mediaResult = await createUpload({
        viewerId,
        kind: MediaKind.photo,
        mimeType: 'image/jpeg',
      });
      expect(mediaResult.success).toBe(true);
      if (!mediaResult.success) {
        return;
      }
      const item = await mediaItemRepository.getById(mediaResult.value.mediaItemId);
      if (!item) {
        return;
      }
      mediaStorage.objects.set(item.storageKey(), { size: 50, mimeType: 'image/jpeg' });
      await finalize({ viewerId, mediaItemId: item.id() });
      const readyItem = await mediaItemRepository.getById(item.id());
      if (!readyItem) {
        return;
      }
      projectionFromReadRepo.set(readyItem.id(), projectionFromAggregate(readyItem));

      const addAlbumItem = buildAddAlbumItem({
        albumRepository,
        mediaItemReadRepository: {
          // eslint-disable-next-line @typescript-eslint/require-await
          getForViewer: async ({ mediaItemId }: { mediaItemId: EntityId }) =>
            projectionFromReadRepo.get(mediaItemId),
        },
      } as never);

      const first = await addAlbumItem({
        viewerId,
        albumId: albumResult.value.albumId,
        mediaItemId: readyItem.id(),
      });
      expect(first.success).toBe(true);
      const second = await addAlbumItem({
        viewerId,
        albumId: albumResult.value.albumId,
        mediaItemId: readyItem.id(),
      });
      expect(second.success).toBe(false);
      let code = '';
      if (!second.success) {
        code = second.error.code;
      }
      expect(code).toBe(AppErrorCollection.album.MediaAlreadyInAlbum.code);
    });
  });
});
