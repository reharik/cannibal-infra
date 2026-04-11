import { ResourceTypeEnum } from '@packages/contracts';
import { withEnumRevival } from '@reharik/smart-enum-knex';
import type { Knex } from 'knex';
import type { CommentRecord } from '../../domain/Comment/Comment';
import { Comment } from '../../domain/Comment/Comment';
import type { EntityId } from '../../types/types';

export type CommentRepository = {
  getById: (id: EntityId) => Promise<Comment | undefined>;
  save: (comment: Comment, resourceId: EntityId) => Promise<void>;
};

type CommentRepositoryDeps = { database: Knex };

export const buildCommentRepository = ({ database }: CommentRepositoryDeps): CommentRepository => {
  const getById = async (id: EntityId): Promise<Comment | undefined> => {
    const commentRow = await withEnumRevival(
      database<CommentRecord>('comment').where({ id }).first(),
      { resourceType: ResourceTypeEnum },
      { strict: true },
    );

    if (!commentRow) {
      return;
    }

    return Comment.rehydrate(commentRow);
  };

  const save = async (comment: Comment, resourceId: EntityId): Promise<void> => {
    const record = comment.toPersistence();
    const row = { ...record, resourceId };

    await database.transaction(async (trx: Knex.Transaction) => {
      const existing = await trx<CommentRecord>('comment').where({ id: record.id }).first();

      if (existing) {
        await trx<CommentRecord>('comment').where({ id: record.id }).update(row);
      } else {
        await trx<CommentRecord>('comment').insert(row);
      }
    });
  };

  return {
    getById,
    save,
  };
};
