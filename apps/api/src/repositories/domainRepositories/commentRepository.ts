import type { Knex } from "knex";
import { IocGeneratedCradle } from "../../di/generated/ioc-registry.types";
import type { EntityId } from "../../types/types";
import { Comment } from "../../domain/Comment/Comment";
import type { CommentRecord } from "../../domain/Comment/Comment";
import { rowToRecord } from "./rowToRecord";
import type { CommentRepository as DomainCommentRepository } from "../../domain/Comment/CommentRepository";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CommentRepository extends DomainCommentRepository {}

export const buildCommentRepository = ({
  database,
}: IocGeneratedCradle): CommentRepository => {
  const getById = async (id: EntityId): Promise<Comment | undefined> => {
    const commentRow = (await database("comment").where({ id }).first()) as
      | Record<string, unknown>
      | undefined;

    if (!commentRow) {
      return;
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

    await database.transaction(async (trx: Knex.Transaction) => {
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
