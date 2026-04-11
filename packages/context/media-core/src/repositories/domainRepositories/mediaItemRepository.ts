import { MediaItemStatus, MediaKind, ResourceTypeEnum } from '@packages/contracts';
import { withEnumRevival } from '@reharik/smart-enum-knex';
import type { Knex } from 'knex';
import type { CommentRecord } from '../../domain/Comment/Comment';
import type { MediaAsset } from '../../domain/MediaAsset/MediaAsset';
import { MediaItem, type MediaItemRecord } from '../../domain/MediaItem/MediaItem';
import type { EntityId } from '../../types/types';

export type MediaItemRepository = {
  getById: (id: EntityId) => Promise<MediaItem | undefined>;
  save: (mediaItem: MediaItem) => Promise<void>;
  saveNewWithInitialAsset: (mediaItem: MediaItem, initialAsset: MediaAsset) => Promise<void>;
};

type MediaItemRepositoryDeps = { database: Knex };

export const buildMediaItemRepository = ({
  database,
}: MediaItemRepositoryDeps): MediaItemRepository => {
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

  const saveNewWithInitialAsset = async (
    mediaItem: MediaItem,
    initialAsset: MediaAsset,
  ): Promise<void> => {
    const itemRecord = mediaItem.toPersistence();
    const { comments, ...mediaItemRow } = itemRecord;
    const assetRecord = initialAsset.toPersistence();

    await database.transaction(async (trx: Knex.Transaction) => {
      await trx('mediaItem').insert(mediaItemRow);
      await trx('mediaAsset').insert(assetRecord);
      if (comments.length > 0) {
        await trx('comment').insert(
          comments.map((comment) => ({
            ...comment,
            resourceType: 'mediaItem',
            resourceId: itemRecord.id,
          })),
        );
      }
    });
  };

  return {
    getById,
    save,
    saveNewWithInitialAsset,
  };
};
