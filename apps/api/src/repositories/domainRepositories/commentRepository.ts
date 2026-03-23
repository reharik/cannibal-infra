import { Container } from "../../container";
import type { EntityId } from "../../types/types";
import { Comment } from "../../domain/Comment/Comment";
import type { CommentRecord } from "../../domain/Comment/Comment";
import { rowToRecord } from "./rowToRecord";
import { RESOLVER } from "awilix";
import type { CommentRepository as DomainCommentRepository } from "../../domain/Comment/CommentRepository";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CommentRepository extends DomainCommentRepository {}

export const buildCommentRepository = ({
  connection,
}: Container): CommentRepository => {
  const getById = async (id: EntityId): Promise<Comment | undefined> => {
    const commentRow = (await connection("comment").where({ id }).first()) as
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(buildCommentRepository as any)[RESOLVER] = {};
