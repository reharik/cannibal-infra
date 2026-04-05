import { MediaItemStatus, MediaKind, ResourceTypeEnum } from '@packages/contracts';
import { withEnumRevival } from '@reharik/smart-enum-knex';
import type { Knex } from 'knex';
import { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';
import type { CommentRecord } from '../../domain/Comment/Comment';
import { MediaItem, type MediaItemRecord } from '../../domain/MediaItem/MediaItem';
import type { MediaItemRepository as DomainMediaItemRepository } from '../../domain/MediaItem/MediaItemRepository';
import type { EntityId } from '../../types/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MediaItemRepository extends DomainMediaItemRepository {}

export const buildMediaItemRepository = ({ database }: IocGeneratedCradle): MediaItemRepository => {
  const getById = async (id: EntityId): Promise<MediaItem | undefined> => {
    const mediaItemRow = await withEnumRevival(
      database<MediaItemRecord>('mediaItem').where({ id }).first(),
      { kind: MediaKind, status: MediaItemStatus },
      { strict: true },
    );
    if (!mediaItemRow) {
      return;
    }

    const commentRows = await withEnumRevival(
      database<CommentRecord>('comment')
        .where({ resourceType: 'mediaItem', resourceId: id })
        .orderBy('createdAt', 'asc'),
      { resourceType: ResourceTypeEnum },
      { strict: true },
    );

    mediaItemRow.comments = commentRows;
    return MediaItem.rehydrate(mediaItemRow);
  };

  const save = async (mediaItem: MediaItem): Promise<void> => {
    const record = mediaItem.toPersistence();
    const { comments, ...mediaItemRow } = record;

    await database.transaction(async (trx: Knex.Transaction) => {
      const existing = await trx<MediaItemRecord>('mediaItem').where({ id: record.id }).first();

      if (existing) {
        await trx<MediaItemRecord>('mediaItem').where({ id: record.id }).update(mediaItemRow);
      } else {
        await trx('mediaItem').insert(mediaItemRow);
      }

      await trx('comment').where({ resourceType: 'mediaItem', resourceId: record.id }).delete();

      if (comments.length > 0) {
        await trx('comment').insert(
          comments.map((comment) => ({
            ...comment,
            resourceType: 'mediaItem',
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
