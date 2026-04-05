import { IocGeneratedCradle } from 'apps/api/src/di/generated/ioc-registry.types';
import {
  AlbumItemParent,
  AlbumParent,
  MediaItemParent,
} from 'apps/api/src/graphql/resolvers/parentModels';
import { MediaItemProjection } from 'apps/api/src/repositories/readRepositories/albumReadRepository';
import { ReadServiceFactoryBase } from '../readServiceBaseType';

export interface ViewerAlbumReadService {
  listAlbums: () => Promise<AlbumParent[]>;
  getAlbumItems: (args: { albumId: string }) => Promise<AlbumItemParent[]>;
}

export interface ViewerAlbumReadServiceFactory extends ReadServiceFactoryBase {
  (args: { viewerId: string }): ViewerAlbumReadService;
}

const mapMediaItemProjectionToParent = (mediaItem: MediaItemProjection): MediaItemParent => ({
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
});

export const buildViewerAlbumReadServiceFactory = ({
  albumReadRepository,
}: IocGeneratedCradle): ViewerAlbumReadServiceFactory => {
  return ({ viewerId }: { viewerId: string }) => ({
    listAlbums: async (): Promise<AlbumParent[]> => {
      const albums = await albumReadRepository.listByViewerId({ viewerId });
      return albums.map((album) => ({
        id: album.id,
        title: album.title,
        coverMedia: mapMediaItemProjectionToParent(album),
      }));
    },

    getAlbumItems: async ({ albumId }: { albumId: string }): Promise<AlbumItemParent[]> => {
      const albumItems = await albumReadRepository.getAlbumItemsForViewer({
        albumId,
        viewerId,
      });
      return albumItems.map((albumItem) => ({
        id: albumItem.id,
        mediaItem: mapMediaItemProjectionToParent(albumItem),
      }));
    },
  });
};
