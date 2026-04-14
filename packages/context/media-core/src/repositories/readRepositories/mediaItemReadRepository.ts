import type { Knex } from 'knex';
import {
  MediaItemCollectionInfo,
  MediaItemRow,
} from '../../services/readServices/viewerReadServices/viewerMediaItemReadService.types';
import { EntityId } from '../../types/types';

export type MediaItemReadRepository = {
  getForViewer: ({
    mediaItemId,
    viewerId,
  }: {
    mediaItemId: EntityId;
    viewerId: EntityId;
  }) => Promise<MediaItemRow | undefined>;
  listForViewer(args: {
    viewerId: EntityId;
    collectionInfo: MediaItemCollectionInfo;
  }): Promise<MediaItemRow[]>;
};

type MediaItemReadRepositoryDeps = { database: Knex };

const mediaItemRowFields = [
  'media_item.id',
  'media_item.owner_id',
  'media_item.storage_key',
  'media_item.kind',
  'media_item.status',
  'media_item.mime_type',
  'media_item.size_bytes',
  'media_item.original_file_name',
  'media_item.width',
  'media_item.height',
  'media_item.duration_seconds',
  'media_item.title',
  'media_item.description',
  'media_item.taken_at',
  'media_item.created_at',
  'media_item.updated_at',
  'media_item.created_by',
  'media_item.updated_by',
];

export const buildMediaItemReadRepository = ({
  database,
}: MediaItemReadRepositoryDeps): MediaItemReadRepository => ({
  getForViewer: async ({
    mediaItemId,
    viewerId,
  }: {
    mediaItemId: EntityId;
    viewerId: EntityId;
  }): Promise<MediaItemRow | undefined> => {
    const row = await database<MediaItemRow>('mediaItem')
      .where({ id: mediaItemId, ownerId: viewerId })
      .first<MediaItemRow>(...mediaItemRowFields);

    return row;
  },
  listForViewer: async ({
    viewerId,
    collectionInfo,
  }: {
    viewerId: EntityId;
    collectionInfo: MediaItemCollectionInfo;
  }): Promise<MediaItemRow[]> => {
    const rows = await database<MediaItemRow>('mediaItem')
      .where({ ownerId: viewerId })
      .orderBy(collectionInfo.sortBy.column, collectionInfo.sortDir.value)
      .orderBy('id', 'asc') // tie-breaker
      .select<MediaItemRow[]>(...mediaItemRowFields)
      .limit(collectionInfo.pageInfo.limit + 1)
      .offset(collectionInfo.pageInfo.offset);
    return rows;
  },
});
