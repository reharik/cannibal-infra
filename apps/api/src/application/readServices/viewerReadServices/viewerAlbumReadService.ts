import { IocGeneratedCradle } from 'apps/api/src/di/generated/ioc-registry.types';

import { StandardEnumItem } from '@reharik/smart-enum';
import { ReadServiceFactoryBase } from '../readServiceBaseType';
import {
  AlbumCollectionInfo,
  AlbumItemCollectionInfo,
  AlbumItemListProjection,
  AlbumListProjection,
  AlbumProjection,
  NamespacedMediaItemRow,
} from './viewerAlbumReadService.types';
import { MediaItemProjection } from './viewerMediaItemReadService.types';

export interface ViewerAlbumReadService {
  listAlbums: (collectionInfo: AlbumCollectionInfo) => Promise<AlbumListProjection>;
  getAlbum: (albumId: string) => Promise<AlbumProjection | undefined>;
  getAlbumItems: (args: {
    albumId: string;
    collectionInfo: AlbumItemCollectionInfo;
  }) => Promise<AlbumItemListProjection>;
}

export interface ViewerAlbumReadServiceFactory extends ReadServiceFactoryBase {
  (args: { viewerId: string }): ViewerAlbumReadService;
}

const mapMediaItemRowToParent = (mediaItem: NamespacedMediaItemRow): MediaItemProjection => {
  const id = mediaItem.mediaItemId ?? '';
  return {
    id,
    ownerId: mediaItem.mediaItemOwnerId ?? '',
    storageKey: mediaItem.mediaItemStorageKey ?? '',
    kind: mediaItem.mediaItemKind ?? '',
    status: mediaItem.mediaItemStatus ?? '',
    mimeType: mediaItem.mediaItemMimeType ?? '',
    sizeBytes: mediaItem.mediaItemSizeBytes ?? 0,
    originalFileName: mediaItem.mediaItemOriginalFileName ?? undefined,
    width: mediaItem.mediaItemWidth,
    height: mediaItem.mediaItemHeight,
    durationSeconds: mediaItem.mediaItemDurationSeconds,
    title: mediaItem.mediaItemTitle,
    description: mediaItem.mediaItemDescription,
    takenAt: mediaItem.mediaItemTakenAt,
    createdAt: mediaItem.mediaItemCreatedAt ?? new Date(),
    updatedAt: mediaItem.mediaItemUpdatedAt ?? new Date(),
  };
};

export type SortableEnum = StandardEnumItem & { column: string };

export const buildViewerAlbumReadServiceFactory = ({
  albumReadRepository,
}: IocGeneratedCradle): ViewerAlbumReadServiceFactory => {
  return ({ viewerId }: { viewerId: string }) => ({
    listAlbums: async (collectionInfo: AlbumCollectionInfo): Promise<AlbumListProjection> => {
      const albums = await albumReadRepository.listByViewerId({
        viewerId,
        collectionInfo,
      });
      const nodes = albums.map((album) => ({
        id: album.id,
        title: album.title,
        createdAt: album.createdAt,
        updatedAt: album.updatedAt,
        coverMedia: album.mediaItemId != null ? mapMediaItemRowToParent(album) : undefined,
      }));

      return {
        nodes,
        pageInfo: collectionInfo.pageInfo,
      };
    },

    getAlbum: async (albumId: string): Promise<AlbumProjection | undefined> => {
      const row = await albumReadRepository.getAlbumForViewer({ albumId, viewerId });
      if (!row) {
        return undefined;
      }
      return {
        id: row.id,
        title: row.title,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        coverMedia: row.mediaItemId != null ? mapMediaItemRowToParent(row) : undefined,
      };
    },

    getAlbumItems: async ({
      albumId,
      collectionInfo,
    }: {
      albumId: string;
      collectionInfo: AlbumItemCollectionInfo;
    }): Promise<AlbumItemListProjection> => {
      const albumItems = await albumReadRepository.getAlbumItemsForViewer({
        albumId,
        viewerId,
        collectionInfo,
      });
      const nodes = albumItems.map((albumItem) => ({
        id: albumItem.id,
        mediaItem: mapMediaItemRowToParent(albumItem),
        createdAt: albumItem.createdAt,
        updatedAt: albumItem.updatedAt,
      }));
      return {
        nodes,
        pageInfo: collectionInfo.pageInfo,
      };
    },
  });
};
