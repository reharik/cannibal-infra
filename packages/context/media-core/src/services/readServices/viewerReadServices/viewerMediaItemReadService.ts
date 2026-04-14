import { MediaAssetKind } from '@packages/contracts';
import { MediaStorage } from '../../../application/media/MediaStorage';
import { resolveMediaAssetUrl } from '../../../application/media/resolveMediaAssetUrl';
import { MediaAssetReadRepository } from '../../../repositories/readRepositories/mediaAssetReadRepository';
import { MediaItemReadRepository } from '../../../repositories/readRepositories/mediaItemReadRepository';
import { EntityId } from '../../../types/types';
import { ReadServiceFactoryBase } from '../readServiceBaseType';
import {
  MediaAssetProjection,
  MediaItemCollectionInfo,
  MediaItemListProjection,
  MediaItemProjection,
  MediaItemRow,
} from './viewerMediaItemReadService.types';

export interface ViewerMediaItemReadService {
  listMediaItems: (collectionInfo: MediaItemCollectionInfo) => Promise<MediaItemListProjection>;
  getMediaItemForViewer: (args: {
    mediaItemId: EntityId;
  }) => Promise<MediaItemProjection | undefined>;
  getAssetsForMediaItem: (args: {
    mediaItemId: EntityId;
    mediaItemStorageKey: string;
  }) => Promise<MediaAssetProjection[]>;
  getAssetForMediaItem: (args: {
    mediaItemId: EntityId;
    mediaItemStorageKey: string;
    requestedKind: MediaAssetKind;
  }) => Promise<MediaAssetProjection | undefined>;
}

export interface ViewerMediaItemReadServiceFactory extends ReadServiceFactoryBase {
  (args: { viewerId: string }): ViewerMediaItemReadService;
}

const normalizeAssetKind = (kind: string): string => kind.trim().toLowerCase();

type ViewerMediaItemReadServiceFactoryDeps = {
  mediaItemReadRepository: MediaItemReadRepository;
  mediaAssetReadRepository: MediaAssetReadRepository;
  mediaStorage: MediaStorage;
};

export const buildViewerMediaItemReadServiceFactory = ({
  mediaItemReadRepository,
  mediaAssetReadRepository,
  mediaStorage,
}: ViewerMediaItemReadServiceFactoryDeps): ViewerMediaItemReadServiceFactory => {
  const parseAssetKind = (kind: string): MediaAssetKind => {
    const normalized = kind.trim().toLowerCase();
    if (normalized === MediaAssetKind.display.value) {
      return MediaAssetKind.display;
    }
    if (normalized === MediaAssetKind.thumbnail.value) {
      return MediaAssetKind.thumbnail;
    }
    return MediaAssetKind.original;
  };

  const getAssetsForMediaItem = async ({
    mediaItemId,
    mediaItemStorageKey,
  }: {
    mediaItemId: EntityId;
    mediaItemStorageKey: string;
  }): Promise<MediaAssetProjection[]> => {
    const assetsByMediaItemId = await mediaAssetReadRepository.listByMediaItemIds([mediaItemId]);
    const assets = assetsByMediaItemId.get(mediaItemId) ?? [];
    return Promise.all(
      assets.map(async (asset) => {
        const resolution = await resolveMediaAssetUrl({
          mediaStorage,
          baseStorageKey: mediaItemStorageKey,
          requestedKind: parseAssetKind(asset.kind),
          assets,
        });
        return {
          ...asset,
          kind: resolution.resolvedKind.value,
          url: resolution.url,
        };
      }),
    );
  };

  return ({ viewerId }: { viewerId: string }) => {
    const withTags = async (rows: MediaItemRow[]): Promise<MediaItemProjection[]> => {
      const ids = rows.map((r) => r.id);
      const tagMap = await mediaItemReadRepository.listTagsForMediaItemIds({
        viewerId,
        mediaItemIds: ids,
      });
      return rows.map((r) => ({ ...r, tags: tagMap.get(r.id) ?? [] }));
    };

    return {
      listMediaItems: async (
        collectionInfo: MediaItemCollectionInfo,
      ): Promise<MediaItemListProjection> => {
        const mediaItems = await mediaItemReadRepository.listForViewer({
          viewerId,
          collectionInfo,
        });
        const nodes = await withTags(mediaItems);
        return {
          nodes,
          pageInfo: collectionInfo.pageInfo,
        };
      },
      getMediaItemForViewer: async ({
        mediaItemId,
      }: {
        mediaItemId: EntityId;
      }): Promise<MediaItemProjection | undefined> => {
        const row = await mediaItemReadRepository.getForViewer({ mediaItemId, viewerId });
        if (!row) {
          return undefined;
        }
        const [projection] = await withTags([row]);
        return projection;
      },
      getAssetsForMediaItem,
      getAssetForMediaItem: async ({
        mediaItemId,
        mediaItemStorageKey,
        requestedKind,
      }: {
        mediaItemId: EntityId;
        mediaItemStorageKey: string;
        requestedKind: MediaAssetKind;
      }): Promise<MediaAssetProjection | undefined> => {
        const assetsByMediaItemId = await mediaAssetReadRepository.listByMediaItemIds([
          mediaItemId,
        ]);
        const rawAssets = assetsByMediaItemId.get(mediaItemId) ?? [];
        if (rawAssets.length === 0) {
          return undefined;
        }

        const resolution = await resolveMediaAssetUrl({
          mediaStorage,
          baseStorageKey: mediaItemStorageKey,
          requestedKind,
          assets: rawAssets,
        });
        const objectExists = await mediaStorage.verifyExistence(resolution.storageKey);
        if (!objectExists) {
          return undefined;
        }

        const resolvedNorm = normalizeAssetKind(resolution.resolvedKind.value);
        const matchedRow = rawAssets.find((a) => normalizeAssetKind(a.kind) === resolvedNorm);
        if (!matchedRow) {
          return undefined;
        }

        return {
          id: matchedRow.id,
          kind: resolution.resolvedKind.value,
          url: resolution.url,
          mimeType: matchedRow.mimeType,
          width: matchedRow.width,
          height: matchedRow.height,
          fileSizeBytes: matchedRow.fileSizeBytes,
          status: matchedRow.status,
          createdAt: matchedRow.createdAt,
          updatedAt: matchedRow.updatedAt,
        };
      },
    };
  };
};
