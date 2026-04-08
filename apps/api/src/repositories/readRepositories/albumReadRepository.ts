import { AlbumSortBy } from '@packages/contracts';
import {
  AlbumItemWithMediaRow,
  AlbumWithCoverRow,
} from '../../application/readServices/viewerReadServices/viewerAlbumReadService.types';
import type { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';
import { CollectionInfo } from '../../types/types';

export type AlbumReadRepository = {
  listByViewerId: ({
    viewerId,
    collectionInfo,
  }: {
    viewerId: string;
    collectionInfo: CollectionInfo<AlbumSortBy>;
  }) => Promise<AlbumWithCoverRow[]>;
  getAlbumForViewer: ({
    albumId,
    viewerId,
  }: {
    albumId: string;
    viewerId: string;
  }) => Promise<AlbumWithCoverRow | undefined>;
  getAlbumItemsForViewer: ({
    albumId,
    viewerId,
    collectionInfo,
  }: {
    albumId: string;
    viewerId: string;
    collectionInfo: CollectionInfo<AlbumSortBy>;
  }) => Promise<AlbumItemWithMediaRow[]>;
};

const mediaItemSelectColumns = [
  'mediaItem.id as mediaItemId',
  'mediaItem.ownerId as mediaItemOwnerId',
  'mediaItem.kind as mediaItemKind',
  'mediaItem.status as mediaItemStatus',
  'mediaItem.storageKey as mediaItemStorageKey',
  'mediaItem.mimeType as mediaItemMimeType',
  'mediaItem.sizeBytes as mediaItemSizeBytes',
  'mediaItem.width as mediaItemWidth',
  'mediaItem.height as mediaItemHeight',
  'mediaItem.durationSeconds as mediaItemDurationSeconds',
  'mediaItem.title as mediaItemTitle',
  'mediaItem.description as mediaItemDescription',
  'mediaItem.takenAt as mediaItemTakenAt',
  'mediaItem.createdAt as mediaItemCreatedAt',
  'mediaItem.updatedAt as mediaItemUpdatedAt',
];

const albumWithCoverSelectColumns = [
  'album.id as id',
  'album.title as title',
  ...mediaItemSelectColumns,
];

const albumItemWithMediaSelectColumns = ['albumItem.id', ...mediaItemSelectColumns];

export const buildAlbumReadRepository = ({
  database,
}: IocGeneratedCradle): AlbumReadRepository => ({
  listByViewerId: async ({
    viewerId,
    collectionInfo,
  }: {
    viewerId: string;
    collectionInfo: CollectionInfo<AlbumSortBy>;
  }): Promise<AlbumWithCoverRow[]> => {
    return database<AlbumWithCoverRow>('album')
      .innerJoin('albumMember', 'albumMember.albumId', 'album.id')
      .leftJoin('mediaItem', 'mediaItem.id', 'album.coverMediaId')
      .where('albumMember.userId', viewerId)
      .select<AlbumWithCoverRow[]>(...albumWithCoverSelectColumns)
      .orderBy(`album.${collectionInfo.sortBy.column}`, collectionInfo.sortDir.value)
      .orderBy('album.id', 'asc') // tie-breaker (unqualified `id` / `created_at` are ambiguous with joined mediaItem)
      .limit(collectionInfo.pageInfo.limit + 1)
      .offset(collectionInfo.pageInfo.offset);
  },

  getAlbumForViewer: async ({
    albumId,
    viewerId,
  }: {
    albumId: string;
    viewerId: string;
  }): Promise<AlbumWithCoverRow | undefined> => {
    const row = await database<AlbumWithCoverRow>('album')
      .innerJoin('albumMember', 'albumMember.albumId', 'album.id')
      .leftJoin('mediaItem', 'mediaItem.id', 'album.coverMediaId')
      .where('albumMember.userId', viewerId)
      .andWhere('album.id', albumId)
      .first<AlbumWithCoverRow>(...albumWithCoverSelectColumns);

    return row;
  },
  getAlbumItemsForViewer: async ({
    albumId,
    viewerId,
    collectionInfo,
  }: {
    albumId: string;
    viewerId: string;
    collectionInfo: CollectionInfo<AlbumSortBy>;
  }): Promise<AlbumItemWithMediaRow[]> => {
    return database<AlbumItemWithMediaRow>('albumItem')
      .innerJoin('album', 'albumItem.albumId', 'album.id')
      .innerJoin('albumMember', 'albumMember.albumId', 'album.id')
      .innerJoin('mediaItem', 'mediaItem.id', 'albumItem.mediaItemId')
      .where('albumMember.userId', viewerId)
      .andWhere('album.id', albumId)
      .select<AlbumItemWithMediaRow[]>(...albumItemWithMediaSelectColumns)
      .orderBy(`album_item.${collectionInfo.sortBy.column}`, collectionInfo.sortDir.value)
      .orderBy('album_item.id', 'asc') // tie-breaker
      .limit(collectionInfo.pageInfo.limit + 1)
      .offset(collectionInfo.pageInfo.offset);
  },
});
