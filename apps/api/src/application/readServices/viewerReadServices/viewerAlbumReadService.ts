import { IocGeneratedCradle } from 'apps/api/src/di/generated/ioc-registry.types';

import { StandardEnumItem } from '@reharik/smart-enum';
import { ReadServiceFactoryBase } from '../readServiceBaseType';
import {
  AlbumCollectionInfo,
  AlbumItemCollectionInfo,
  AlbumItemListProjection,
  AlbumListProjection,
  NamespacedMediaItemRow,
} from './viewerAlbumReadService.types';
import { MediaItemProjection } from './viewerMediaItemReadService.types';

export interface ViewerAlbumReadService {
  listAlbums: (collectionInfo: AlbumCollectionInfo) => Promise<AlbumListProjection>;
  getAlbumItems: (args: {
    albumId: string;
    collectionInfo: AlbumItemCollectionInfo;
  }) => Promise<AlbumItemListProjection>;
}

export interface ViewerAlbumReadServiceFactory extends ReadServiceFactoryBase {
  (args: { viewerId: string }): ViewerAlbumReadService;
}

const mapMediaItemRowToParent = (mediaItem: NamespacedMediaItemRow): MediaItemProjection => ({
  id: mediaItem.mediaItemId ?? '',
  ownerId: mediaItem.mediaItemOwnerId ?? '',
  kind: mediaItem.mediaItemKind ?? '',
  status: mediaItem.mediaItemStatus ?? '',
  storageKey: mediaItem.mediaItemStorageKey ?? '',
  mimeType: mediaItem.mediaItemMimeType ?? '',
  sizeBytes: mediaItem.mediaItemSizeBytes ?? 0,
  width: mediaItem.mediaItemWidth,
  height: mediaItem.mediaItemHeight,
  title: mediaItem.mediaItemTitle,
  description: mediaItem.mediaItemDescription,
  takenAt: mediaItem.mediaItemTakenAt,
  createdAt: mediaItem.mediaItemCreatedAt,
  updatedAt: mediaItem.mediaItemUpdatedAt,
});

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
        coverMedia: mapMediaItemRowToParent(album),
      }));

      return {
        nodes,
        pageInfo: collectionInfo.pageInfo,
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
