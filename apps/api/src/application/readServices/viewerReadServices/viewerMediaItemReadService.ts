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
    return assets.map((asset) => {
      const resolution = resolveMediaAssetUrl({
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
    });
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
      const assets = await getAssetsForMediaItem({ mediaItemId, mediaItemStorageKey });
      const resolution = resolveMediaAssetUrl({
        mediaStorage,
        baseStorageKey: mediaItemStorageKey,
        requestedKind,
        assets,
      });
      const resolvedStorageKey = resolution.storageKey;
      const objectExists = await mediaStorage.verifyExistence(resolvedStorageKey);
      if (!objectExists) {
        return null;
      }
      const selectedAsset = assets.find(
        (asset) => asset.kind.toLowerCase() === resolution.resolvedKind.value.toLowerCase(),
      );
      return {
        id: selectedAsset?.id ?? mediaItemId,
        kind: resolution.resolvedKind.value,
        url: resolution.url,
        mimeType: selectedAsset?.mimeType ?? 'application/octet-stream',
        width: selectedAsset?.width,
        height: selectedAsset?.height,
        fileSizeBytes: selectedAsset?.fileSizeBytes,
        status: selectedAsset?.status ?? 'PENDING',
        createdAt: selectedAsset?.createdAt ?? new Date(),
        updatedAt: selectedAsset?.updatedAt ?? new Date(),
      };
    },
  });
};
