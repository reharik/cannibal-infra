import { ResourceTypeEnum } from '@packages/contracts';
import { withEnumRevival } from '@reharik/smart-enum-knex';
import type { Knex } from 'knex';
import { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';
import type { CommentRecord } from '../../domain/Comment/Comment';
import { Comment } from '../../domain/Comment/Comment';
import type { CommentRepository as DomainCommentRepository } from '../../domain/Comment/CommentRepository';
import type { EntityId } from '../../types/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CommentRepository extends DomainCommentRepository {}

export const buildCommentRepository = ({ database }: IocGeneratedCradle): CommentRepository => {
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
