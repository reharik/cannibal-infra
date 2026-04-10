import {
  MediaItemCollectionInfo,
  MediaItemRow,
} from '../../application/readServices/viewerReadServices/viewerMediaItemReadService.types';
import type { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';
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

const mediaItemRowFields = [
  'media_item.id',
  'media_item.ownerId',
  'media_item.storageKey',
  'media_item.kind',
  'media_item.status',
  'media_item.mimeType',
  'media_item.sizeBytes',
  'media_item.originalFileName',
  'media_item.width',
  'media_item.height',
  'media_item.durationSeconds',
  'media_item.title',
  'media_item.description',
  'media_item.takenAt',
  'media_item.createdAt',
  'media_item.updatedAt',
  'media_item.createdBy',
  'media_item.updatedBy',
];

export const buildMediaItemReadRepository = ({
  database,
}: IocGeneratedCradle): MediaItemReadRepository => ({
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
      .orderBy(`media_item.${collectionInfo.sortBy.column}`, collectionInfo.sortDir.value)
      .orderBy('media_item.id', 'asc') // tie-breaker
      .limit(collectionInfo.pageInfo.limit + 1)
      .offset(collectionInfo.pageInfo.offset)
      .select<MediaItemRow[]>(...mediaItemRowFields);
    return rows;
  },
});
