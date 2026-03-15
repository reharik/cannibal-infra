import type { Knex } from "knex";
import type { EntityId } from "../types/types";
import { MediaItem, type MediaItemRecord } from "../domain/MediaItem/MediaItem";
import type { CommentRecord } from "../domain/Comment/Comment";
import type { MediaItemRepository } from "../domain/MediaItem/MediaItemRepository";
import { rowToRecord } from "./rowToRecord";

export const createMediaItemRepository = (
  connection: Knex,
): MediaItemRepository => {
  const getById = async (id: EntityId): Promise<MediaItem | null> => {
    const mediaItemRow = (await connection("mediaItem")
      .where({ id })
      .first()) as Record<string, unknown> | undefined;

    if (!mediaItemRow) {
      return null;
    }

    const commentRows = (await connection("comment")
      .where({ resourceType: "mediaItem", resourceId: id })
      .orderBy("createdAt", "asc")) as Record<string, unknown>[];

    type MediaItemRecordBase = Omit<MediaItemRecord, "comments">;

    const record: MediaItemRecord = {
      ...rowToRecord<MediaItemRecordBase>(mediaItemRow),
      comments: commentRows.map((row) =>
        rowToRecord<CommentRecord>(row, ["resourceId"]),
      ),
    };

    return MediaItem.rehydrate(record);
  };

  const save = async (mediaItem: MediaItem): Promise<void> => {
    const record = mediaItem.toPersistence();
    const { comments, ...mediaItemRow } = record;

    await connection.transaction(async (trx) => {
      const existing = (await trx("mediaItem")
        .where({ id: record.id })
        .first()) as Record<string, unknown> | undefined;

      if (existing) {
        await trx("mediaItem").where({ id: record.id }).update(mediaItemRow);
      } else {
        await trx("mediaItem").insert(mediaItemRow);
      }

      await trx("comment")
        .where({ resourceType: "mediaItem", resourceId: record.id })
        .delete();

      if (comments.length > 0) {
        await trx("comment").insert(
          comments.map((comment) => ({
            ...comment,
            resourceType: "mediaItem",
            resourceId: record.id,
          })),
        );
      }
    });
  };

  return {
    getById,
    save,
  };
};
