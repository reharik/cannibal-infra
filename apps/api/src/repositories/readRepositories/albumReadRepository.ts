import type { IocGeneratedCradle } from "../../di/generated/ioc-registry.types";

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
  database,
}: IocGeneratedCradle): AlbumReadRepository => ({
  listByViewerId: async ({
    viewerId,
  }: {
    viewerId: string;
  }): Promise<AlbumRow[]> => {
    return database("album")
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
    const row = await database("album")
      .innerJoin("album_member", "album_member.album_id", "album.id")
      .where("album_member.user_id", viewerId)
      .andWhere("album.id", albumId)
      .first<AlbumRow>("album.id", "album.title", "album.coverMediaId");

    return row;
  },
});
