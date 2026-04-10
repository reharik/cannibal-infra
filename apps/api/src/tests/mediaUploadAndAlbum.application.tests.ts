import { AppErrorCollection, MediaItemStatus, MediaKind } from '@packages/contracts';
import { MediaAssetKind } from '@packages/contracts';
import { Readable } from 'node:stream';
import type { MediaStorage } from '../application/media/MediaStorage';
import { buildMediaAssetStorageKey } from '../application/media/MediaStorage';
import type { MediaItemRow } from '../application/readServices/viewerReadServices/viewerMediaItemReadService.types';
import { buildAddAlbumItem } from '../application/writeServices/album/addAlbumItem';
import { buildCreateAlbum } from '../application/writeServices/album/createAlbum';
import { buildCreateMediaItemUpload } from '../application/writeServices/mediaItem/createMediaItemUpload';
import { buildFinalizeMediaItemUpload } from '../application/writeServices/mediaItem/finalizeMediaItemUpload';
import { Album } from '../domain/Album/Album';
import type { AlbumRepository } from '../domain/Album/AlbumRepository';
import { MediaAsset } from '../domain/MediaAsset/MediaAsset';
import type { MediaAssetRepository } from '../domain/MediaAsset/MediaAssetRepository';
import type { MediaProcessingJobRepository } from '../domain/MediaProcessingJob/MediaProcessingJobRepository';
import { MediaItem } from '../domain/MediaItem/MediaItem';
import type { MediaItemRepository } from '../domain/MediaItem/MediaItemRepository';
import { EntityId } from '../types/types';
import { TEST_VIEWER_A_ID, TEST_VIEWER_B_ID } from './testViewerIds';

/** 1×1 PNG — used so finalize can read width/height from uploaded bytes. */
const MINIMAL_PNG_1X1 = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00,
  0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00,
  0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01,
  0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

type ObjectState = { size: number; mimeType?: string; body?: Buffer };

const assetCompositeKey = (mediaItemId: string, kind: MediaAssetKind): string =>
  `${mediaItemId}:${kind.value}`;

const createInMemoryMediaAssetRepository = (): MediaAssetRepository => {
  const byKey = new Map<string, MediaAsset>();
  return {
    getFirstByMediaItemId: async (mediaItemId: string) => {
      const direct = byKey.get(assetCompositeKey(mediaItemId, MediaAssetKind.original));
      if (direct) {
        return direct;
      }
      for (const asset of byKey.values()) {
        if (asset.mediaItemId() === mediaItemId) {
          return asset;
        }
      }
      return undefined;
    },
    getByMediaItemIdAndKind: async (mediaItemId: string, kind: MediaAssetKind) =>
      byKey.get(assetCompositeKey(mediaItemId, kind)),
    save: async (asset) => {
      byKey.set(assetCompositeKey(asset.mediaItemId(), asset.kind()), asset);
    },
  };
};

const createNoopMediaProcessingJobRepository = (): MediaProcessingJobRepository => ({
  enqueueIfNoneActive: async () => {},
  claimNextAvailableJob: async () => undefined,
  markSucceeded: async () => {},
  markFailed: async () => {},
});

const createTrackingMediaProcessingJobRepository = (): MediaProcessingJobRepository & {
  enqueued: { mediaItemId: string; actorId: string }[];
} => {
  const enqueued: { mediaItemId: string; actorId: string }[] = [];
  return {
    enqueued,
    enqueueIfNoneActive: async (input) => {
      enqueued.push(input);
    },
    claimNextAvailableJob: async () => undefined,
    markSucceeded: async () => {},
    markFailed: async () => {},
  };
};

const createInMemoryMediaItemRepository = (
  mediaAssetRepository: MediaAssetRepository,
): MediaItemRepository => {
  const byId = new Map<string, MediaItem>();
  return {
    getById: async (id: string) => byId.get(id),
    save: async (item: MediaItem) => {
      byId.set(item.id(), item);
    },
    saveNewWithInitialAsset: async (item, uploadAsset) => {
      byId.set(item.id(), item);
      await mediaAssetRepository.save(uploadAsset);
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
    getUploadTarget: async ({ storageKey, mimeType }) => ({
      method: 'PUT' as const,
      url: `${serverUrl}/presigned?key=${encodeURIComponent(storageKey)}`,
      headers: mimeType ? [{ name: 'Content-Type', value: mimeType }] : [],
    }),
    writeObject: async () => {
      return;
    },
    getObjectMetadata: async (storageKey: string) => {
      const o = objects.get(storageKey);
      if (!o) {
        return null;
      }
      const size = o.body !== undefined ? o.body.length : o.size;
      return { size, mimeType: o.mimeType };
    },
    verifyExistence: async (storageKey: string) => objects.has(storageKey),
    getObjectAccessUrl: async ({ storageKey }) =>
      `${serverUrl}/api/media/objects/${encodeURIComponent(storageKey)}`,
    getObjectStream: async (storageKey: string) => {
      const object = objects.get(storageKey);
      if (!object) {
        return null;
      }
      const buf = object.body ?? Buffer.alloc(object.size);
      return {
        body: Readable.from(buf),
        mimeType: object.mimeType,
      };
    },
    getObjectBuffer: async (storageKey: string, maxBytes: number) => {
      const object = objects.get(storageKey);
      if (!object) {
        return null;
      }
      const raw = object.body ?? Buffer.alloc(object.size);
      return raw.subarray(0, Math.min(raw.length, maxBytes));
    },
  };
};

const projectionFromAggregate = (item: MediaItem): MediaItemRow => {
  const p = item.toPersistence();
  return {
    id: item.id(),
    ownerId: item.ownerId(),
    storageKey: item.storageKey(),
    kind: item.kind().value,
    status: item.status().value,
    mimeType: p.mimeType,
    sizeBytes: p.sizeBytes ?? 0,
    width: p.width,
    height: p.height,
    durationSeconds: p.durationSeconds,
    title: p.title,
    originalFileName: p.originalFileName,
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
      const mediaAssetRepository = createInMemoryMediaAssetRepository();
      const mediaItemRepository = createInMemoryMediaItemRepository(mediaAssetRepository);
      const mediaStorage = createTrackingMediaStorage(serverUrl);
      const createUpload = buildCreateMediaItemUpload({
        mediaItemRepository,
        mediaStorage,
      } as never);

      const result = await createUpload({
        viewerId: viewerA,
        kind: MediaKind.photo,
        mimeType: 'image/jpeg',
        originalFileName: '  vacation.jpg ',
      });

      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }
      expect(result.value.status).toBe(MediaItemStatus.pending);
      expect(result.value.uploadTarget.method).toBe('PUT');
      expect(result.value.uploadTarget.url).toContain('/presigned?');

      const stored = await mediaItemRepository.getById(result.value.mediaItemId);
      expect(stored).toBeDefined();
      expect(stored?.status()).toBe(MediaItemStatus.pending);
      const persisted = stored?.toPersistence();
      expect(persisted?.originalFileName).toBe('vacation.jpg');
      expect(persisted?.title).toBeUndefined();
    });
  });

  describe('When bytes are recorded in storage then finalize runs', () => {
    it('should transition the item to uploaded and return confirmed size and mime type', async () => {
      const mediaAssetRepository = createInMemoryMediaAssetRepository();
      const mediaItemRepository = createInMemoryMediaItemRepository(mediaAssetRepository);
      const mediaStorage = createTrackingMediaStorage(serverUrl);
      const createUpload = buildCreateMediaItemUpload({
        mediaItemRepository,
        mediaStorage,
      } as never);
      const finalize = buildFinalizeMediaItemUpload({
        mediaItemRepository,
        mediaAssetRepository,
        mediaStorage,
        mediaProcessingJobRepository: createNoopMediaProcessingJobRepository(),
      } as never);

      const created = await createUpload({
        viewerId: viewerA,
        kind: MediaKind.photo,
        mimeType: 'image/png',
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
      const asset = await mediaAssetRepository.getFirstByMediaItemId(created.value.mediaItemId);
      expect(asset).toBeDefined();
      if (!asset) {
        return;
      }
      mediaStorage.objects.set(
        buildMediaAssetStorageKey(item.storageKey(), MediaAssetKind.original),
        {
          size: MINIMAL_PNG_1X1.length,
          mimeType: 'image/png',
          body: MINIMAL_PNG_1X1,
        },
      );

      const finalized = await finalize({
        viewerId: viewerA,
        mediaItemId: created.value.mediaItemId,
      });
      expect(finalized.success).toBe(true);
      if (!finalized.success) {
        return;
      }
      expect(finalized.value.status).toBe(MediaItemStatus.uploaded);
      expect(finalized.value.size).toBe(MINIMAL_PNG_1X1.length);
      expect(finalized.value.mimeType).toBe('image/png');

      const after = await mediaItemRepository.getById(created.value.mediaItemId);
      expect(after?.status()).toBe(MediaItemStatus.uploaded);
      expect(after?.width()).toBeUndefined();
      expect(after?.height()).toBeUndefined();
    });

    it('should enqueue a background processing job for photo media', async () => {
      const mediaAssetRepository = createInMemoryMediaAssetRepository();
      const mediaItemRepository = createInMemoryMediaItemRepository(mediaAssetRepository);
      const mediaStorage = createTrackingMediaStorage(serverUrl);
      const jobRepository = createTrackingMediaProcessingJobRepository();
      const createUpload = buildCreateMediaItemUpload({
        mediaItemRepository,
        mediaStorage,
      } as never);
      const finalize = buildFinalizeMediaItemUpload({
        mediaItemRepository,
        mediaAssetRepository,
        mediaStorage,
        mediaProcessingJobRepository: jobRepository,
      } as never);

      const created = await createUpload({
        viewerId: viewerA,
        kind: MediaKind.photo,
        mimeType: 'image/png',
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
      mediaStorage.objects.set(
        buildMediaAssetStorageKey(item.storageKey(), MediaAssetKind.original),
        {
          size: MINIMAL_PNG_1X1.length,
          mimeType: 'image/png',
          body: MINIMAL_PNG_1X1,
        },
      );

      const finalized = await finalize({
        viewerId: viewerA,
        mediaItemId: created.value.mediaItemId,
      });
      expect(finalized.success).toBe(true);
      expect(jobRepository.enqueued).toEqual([
        { mediaItemId: created.value.mediaItemId, actorId: viewerA },
      ]);
    });
  });

  describe('When finalize runs before any object exists in storage', () => {
    it('should fail and leave the media item pending', async () => {
      const mediaAssetRepository = createInMemoryMediaAssetRepository();
      const mediaItemRepository = createInMemoryMediaItemRepository(mediaAssetRepository);
      const mediaStorage = createTrackingMediaStorage(serverUrl);
      const createUpload = buildCreateMediaItemUpload({
        mediaItemRepository,
        mediaStorage,
      } as never);
      const finalize = buildFinalizeMediaItemUpload({
        mediaItemRepository,
        mediaAssetRepository,
        mediaStorage,
        mediaProcessingJobRepository: createNoopMediaProcessingJobRepository(),
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
      const mediaAssetRepository = createInMemoryMediaAssetRepository();
      const mediaItemRepository = createInMemoryMediaItemRepository(mediaAssetRepository);
      const mediaStorage = createTrackingMediaStorage(serverUrl);
      const createUpload = buildCreateMediaItemUpload({
        mediaItemRepository,
        mediaStorage,
      } as never);
      const finalize = buildFinalizeMediaItemUpload({
        mediaItemRepository,
        mediaAssetRepository,
        mediaStorage,
        mediaProcessingJobRepository: createNoopMediaProcessingJobRepository(),
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
      const asset = await mediaAssetRepository.getFirstByMediaItemId(item.id());
      if (!asset) {
        return;
      }
      mediaStorage.objects.set(buildMediaAssetStorageKey(item.storageKey(), MediaAssetKind.original), {
        size: MINIMAL_PNG_1X1.length,
        mimeType: 'image/png',
        body: MINIMAL_PNG_1X1,
      });

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
      const mediaAssetRepository = createInMemoryMediaAssetRepository();
      const mediaItemRepository = createInMemoryMediaItemRepository(mediaAssetRepository);
      const projectionFromReadRepo = new Map<string, MediaItemRow>();

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

  describe('When addAlbumItem is called for uploaded media', () => {
    it('should persist the album item', async () => {
      const albumRepository = createInMemoryAlbumRepository();
      const mediaAssetRepository = createInMemoryMediaAssetRepository();
      const mediaItemRepository = createInMemoryMediaItemRepository(mediaAssetRepository);
      const projectionFromReadRepo = new Map<string, MediaItemRow>();
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
        mediaAssetRepository,
        mediaStorage,
        mediaProcessingJobRepository: createNoopMediaProcessingJobRepository(),
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
      const asset = await mediaAssetRepository.getFirstByMediaItemId(item.id());
      if (!asset) {
        return;
      }
      mediaStorage.objects.set(buildMediaAssetStorageKey(item.storageKey(), MediaAssetKind.original), {
        size: MINIMAL_PNG_1X1.length,
        mimeType: 'image/png',
        body: MINIMAL_PNG_1X1,
      });
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
      const mediaAssetRepository = createInMemoryMediaAssetRepository();
      const mediaItemRepository = createInMemoryMediaItemRepository(mediaAssetRepository);
      const projectionFromReadRepo = new Map<string, MediaItemRow>();
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
        mediaAssetRepository,
        mediaStorage,
        mediaProcessingJobRepository: createNoopMediaProcessingJobRepository(),
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
      const asset = await mediaAssetRepository.getFirstByMediaItemId(item.id());
      if (!asset) {
        return;
      }
      mediaStorage.objects.set(buildMediaAssetStorageKey(item.storageKey(), MediaAssetKind.original), {
        size: MINIMAL_PNG_1X1.length,
        mimeType: 'image/png',
        body: MINIMAL_PNG_1X1,
      });
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
