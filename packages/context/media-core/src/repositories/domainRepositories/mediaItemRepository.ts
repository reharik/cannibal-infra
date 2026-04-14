import {
  MediaAssetKind,
  MediaAssetStatus,
  MediaItemStatus,
  MediaKind,
  ResourceTypeEnum,
} from '@packages/contracts';
import { withEnumRevival } from '@reharik/smart-enum-knex';
import type { Knex } from 'knex';
import type { CommentRecord } from '../../domain/Comment/Comment';
import { MediaAssetRecord } from '../../domain/MediaItem/MediaAsset';
import { MediaItem, type MediaItemRecord } from '../../domain/MediaItem/MediaItem';
import { RepoOptions, runInTransaction } from '../../infrastructure/repositories/runInTransaction';
import type { EntityId } from '../../types/types';

export type MediaItemRepository = {
  getById: (id: EntityId) => Promise<MediaItem | undefined>;
  save: (mediaItem: MediaItem, options?: RepoOptions) => Promise<void>;
  delete: (mediaItem: MediaItem, options?: RepoOptions) => Promise<void>;
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

    const assetRows = await withEnumRevival(
      database<MediaAssetRecord>('mediaAsset')
        .where({ mediaItemId: id })
        .orderBy('createdAt', 'asc'),
      { kind: MediaAssetKind, status: MediaAssetStatus },
      { strict: true },
    );

    const commentRows = await withEnumRevival(
      database<CommentRecord>('comment')
        .where({ resourceType: 'mediaItem', resourceId: id })
        .orderBy('createdAt', 'asc'),
      { resourceType: ResourceTypeEnum },
      { strict: true },
    );

    mediaItemRow.comments = commentRows;
    mediaItemRow.assets = assetRows;
    return MediaItem.rehydrate(mediaItemRow);
  };

  const save = async (mediaItem: MediaItem, options?: RepoOptions): Promise<void> => {
    await runInTransaction(database, options, async (trx) => {
      const record = mediaItem.toPersistence();
      const { comments, assets, ...mediaItemRow } = record;

      const existing = await trx<MediaItemRecord>('mediaItem').where({ id: record.id }).first();

      if (existing) {
        await trx<MediaItemRecord>('mediaItem').where({ id: record.id }).update(mediaItemRow);
      } else {
        await trx('mediaItem').insert(mediaItemRow);
      }

      if (assets.length > 0) {
        const assetRows = assets.map((asset) => ({
          ...asset,
          mediaItemId: record.id,
        }));
        await trx('mediaAsset').insert(assetRows).onConflict(['media_item_id', 'kind']).merge();
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

  const deleteMediaItem = async (
    mediaItem: MediaItem,
    options: RepoOptions = {},
  ): Promise<void> => {
    await runInTransaction(database, options, async (trx) => {
      return await trx<MediaItemRecord>('mediaItem').where({ id: mediaItem.id() }).delete();
    });
  };

  return {
    getById,
    save,
    delete: deleteMediaItem,
  };
};
