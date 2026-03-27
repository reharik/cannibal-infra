import { IocGeneratedCradle } from "apps/api/src/di/generated/ioc-registry.types";

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

export type AlbumService = ({ viewerId }: { viewerId: string }) => {
  listAlbums: () => Promise<AlbumRow[]>;
  getAlbumCoverMedia: ({
    albumId,
  }: {
    albumId: string;
  }) => Promise<MediaItemRow | undefined>;
};

export const buildAlbumService = ({
  albumReadRepository,
  mediaItemReadRepository,
}: IocGeneratedCradle): AlbumService => {
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
