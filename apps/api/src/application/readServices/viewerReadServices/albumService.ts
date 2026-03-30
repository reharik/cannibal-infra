import { IocGeneratedCradle } from "apps/api/src/di/generated/ioc-registry.types";
import { ReadServiceFactoryBase } from "../readServiceBaseType";

type AlbumRow = {
  id: string;
  title: string;
  coverMediaId?: string;
};

type MediaItemRow = {
  id: string;
  kind: string;
  status: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
};

export interface AlbumService {
  listAlbums: () => Promise<AlbumRow[]>;
  getAlbumCoverMedia: (args: {
    albumId: string;
  }) => Promise<MediaItemRow | undefined>;
}

export interface AlbumServiceFactory extends ReadServiceFactoryBase {
  (args: { viewerId: string }): AlbumService;
}

export const buildAlbumServiceFactory = ({
  albumReadRepository,
  mediaItemReadRepository,
}: IocGeneratedCradle): AlbumServiceFactory => {
  return ({ viewerId }: { viewerId: string }) => ({
    listAlbums: async (): Promise<AlbumRow[]> => {
      return albumReadRepository.listByViewerId({ viewerId });
    },

    getAlbumCoverMedia: async ({
      albumId,
    }: {
      albumId: string;
    }): Promise<MediaItemRow | undefined> => {
      const album = await albumReadRepository.getByViewerId({
        albumId,
        viewerId,
      });

      if (!album || !album.coverMediaId) {
        return;
      }

      return mediaItemReadRepository.getCoverMediaByAlbumId({ albumId });
    },
  });
};
