import type { Knex } from "knex";
import type { EntityId } from "../types/types";
import { Comment } from "../domain/Comment/Comment";
import type { CommentRecord } from "../domain/Comment/Comment";
import type { CommentRepository } from "../domain/Comment/CommentRepository";
import { rowToRecord } from "./rowToRecord";

export const createCommentRepository = (
  connection: Knex,
): CommentRepository => {
  const getById = async (id: EntityId): Promise<Comment | null> => {
    const commentRow = (await connection("comment").where({ id }).first()) as
      | Record<string, unknown>
      | undefined;

    if (!commentRow) {
      return null;
    }

    const record = rowToRecord<CommentRecord>(commentRow, ["resourceId"]);
    return Comment.rehydrate(record);
  };

  const save = async (
    comment: Comment,
    resourceId: EntityId,
  ): Promise<void> => {
    const record = comment.toPersistence();
    const row = { ...record, resourceId };

    await connection.transaction(async (trx) => {
      const existing = (await trx("comment")
        .where({ id: record.id })
        .first()) as Record<string, unknown> | undefined;

      if (existing) {
        await trx("comment").where({ id: record.id }).update(row);
      } else {
        await trx("comment").insert(row);
      }
    });
  };

  return {
    getById,
    save,
  };
};
