import { RESOLVER, Lifetime } from "awilix";
import type { Container } from "../../container";

export type MediaItemReadRepository = {
  getCoverMediaByAlbumId: ({
    albumId,
  }: {
    albumId: string;
  }) => Promise<MediaItemRow | undefined>;
  getById: ({
    mediaItemId,
  }: {
    mediaItemId: string;
  }) => Promise<MediaItemRow | undefined>;
};

type MediaItemRow = {
  id: string;
  ownerId: string;
  kind: string;
  status: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  title?: string;
  description?: string;
  takenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
};

const mediaItemRowFields = [
  "media_item.id",
  "media_item.ownerId",
  "media_item.kind",
  "media_item.status",
  "media_item.storageKey",
  "media_item.mimeType",
  "media_item.sizeBytes",
  "media_item.width",
  "media_item.height",
  "media_item.durationSeconds",
  "media_item.title",
  "media_item.description",
  "media_item.takenAt",
  "media_item.createdAt",
  "media_item.updatedAt",
  "media_item.createdBy",
  "media_item.updatedBy",
];

export const buildMediaItemReadRepository = ({
  connection,
}: Container): MediaItemReadRepository => {
  return {
    getCoverMediaByAlbumId: async ({
      albumId,
    }: {
      albumId: string;
    }): Promise<MediaItemRow | undefined> => {
      const row = await connection("media_item")
        .innerJoin("album", "album.coverMediaId", "media_item.id")
        .where("album.id", albumId)
        .first<MediaItemRow>(...mediaItemRowFields);

      return row;
    },

    getById: async ({
      mediaItemId,
    }: {
      mediaItemId: string;
    }): Promise<MediaItemRow | undefined> => {
      const row = await connection("media_item")
        .where("media_item.id", mediaItemId)
        .first<MediaItemRow>(...mediaItemRowFields);

      return row;
    },
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(buildMediaItemReadRepository as any)[RESOLVER] = {
  lifetime: Lifetime.SCOPED,
};
