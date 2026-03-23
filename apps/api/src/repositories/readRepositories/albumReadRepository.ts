import { RESOLVER, Lifetime } from "awilix";
import type { Container } from "../../container";

export type AlbumReadRepository = {
  listByViewerId: ({ viewerId }: { viewerId: string }) => Promise<AlbumRow[]>;
  getByViewerId: ({
    albumId,
    viewerId,
  }: {
    albumId: string;
    viewerId: string;
  }) => Promise<AlbumRow | undefined>;
};

type AlbumRow = {
  id: string;
  title: string;
  coverMediaId: string | undefined;
};

export const buildAlbumReadRepository = ({
  connection,
}: Container): AlbumReadRepository => {
  return {
    listByViewerId: async ({
      viewerId,
    }: {
      viewerId: string;
    }): Promise<AlbumRow[]> => {
      return connection("album")
        .innerJoin("album_member", "album_member.album_id", "album.id")
        .where("album_member.user_id", viewerId)
        .select<AlbumRow[]>("album.id", "album.title", "album.coverMediaId");
    },

    getByViewerId: async ({
      albumId,
      viewerId,
    }: {
      albumId: string;
      viewerId: string;
    }): Promise<AlbumRow | undefined> => {
      const row = await connection("album")
        .innerJoin("album_member", "album_member.album_id", "album.id")
        .where("album_member.user_id", viewerId)
        .andWhere("album.id", albumId)
        .first<AlbumRow>("album.id", "album.title", "album.coverMediaId");

      return row;
    },
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(buildAlbumReadRepository as any)[RESOLVER] = {
  lifetime: Lifetime.SCOPED,
};
