import { MediaAssetKind } from '@packages/contracts';
import { IocGeneratedCradle } from 'apps/api/src/di/generated/ioc-registry.types';
import { EntityId } from 'apps/api/src/types/types';
import { resolveMediaAssetUrl } from '../../media/resolveMediaAssetUrl';
import { ReadServiceFactoryBase } from '../readServiceBaseType';
import {
  MediaAssetProjection,
  MediaItemCollectionInfo,
  MediaItemListProjection,
  MediaItemProjection,
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
  }) => Promise<MediaAssetProjection | null>;
}

export interface ViewerMediaItemReadServiceFactory extends ReadServiceFactoryBase {
  (args: { viewerId: string }): ViewerMediaItemReadService;
}

const normalizeAssetKind = (kind: string): string => kind.trim().toLowerCase();

export const buildViewerMediaItemReadServiceFactory = ({
  mediaItemReadRepository,
  mediaAssetReadRepository,
  mediaStorage,
}: IocGeneratedCradle): ViewerMediaItemReadServiceFactory => {
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

  return ({ viewerId }: { viewerId: string }) => ({
    listMediaItems: async (
      collectionInfo: MediaItemCollectionInfo,
    ): Promise<MediaItemListProjection> => {
      const mediaItems = await mediaItemReadRepository.listForViewer({ viewerId, collectionInfo });
      return {
        nodes: mediaItems,
        pageInfo: collectionInfo.pageInfo,
      };
    },
    getMediaItemForViewer: async ({
      mediaItemId,
    }: {
      mediaItemId: EntityId;
    }): Promise<MediaItemProjection | undefined> => {
      return mediaItemReadRepository.getForViewer({ mediaItemId, viewerId });
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
    }): Promise<MediaAssetProjection | null> => {
      const assetsByMediaItemId = await mediaAssetReadRepository.listByMediaItemIds([mediaItemId]);
      const rawAssets = assetsByMediaItemId.get(mediaItemId) ?? [];
      if (rawAssets.length === 0) {
        return null;
      }

      const resolution = await resolveMediaAssetUrl({
        mediaStorage,
        baseStorageKey: mediaItemStorageKey,
        requestedKind,
        assets: rawAssets,
      });
      const objectExists = await mediaStorage.verifyExistence(resolution.storageKey);
      if (!objectExists) {
        return null;
      }

      const resolvedNorm = normalizeAssetKind(resolution.resolvedKind.value);
      const matchedRow = rawAssets.find((a) => normalizeAssetKind(a.kind) === resolvedNorm);
      if (!matchedRow) {
        return null;
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
  });
};
