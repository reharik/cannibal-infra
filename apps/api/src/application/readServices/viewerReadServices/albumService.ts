import { RESOLVER, Lifetime } from "awilix";
import type { AlbumReadRepository } from "../../../repositories/readRepositories/albumReadRepository";
import type { MediaItemReadRepository } from "../../../repositories/readRepositories/mediaItemReadRepository";

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
}: {
  albumReadRepository: AlbumReadRepository;
  mediaItemReadRepository: MediaItemReadRepository;
}): AlbumService => {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(buildAlbumService as any)[RESOLVER] = {
  name: "albumService",
  group: "readViewerServices",
  lifetime: Lifetime.SCOPED,
};
