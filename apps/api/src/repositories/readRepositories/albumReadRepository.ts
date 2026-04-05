import type { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';
import { EntityId } from '../../types/types';

export type AlbumReadRepository = {
  listByViewerId: ({ viewerId }: { viewerId: string }) => Promise<AlbumWithCoverProjection[]>;
  getAlbumForViewer: ({
    albumId,
    viewerId,
  }: {
    albumId: string;
    viewerId: string;
  }) => Promise<AlbumWithCoverProjection | undefined>;
  getAlbumItemsForViewer: ({
    albumId,
    viewerId,
  }: {
    albumId: string;
    viewerId: string;
  }) => Promise<AlbumItemWithMediaProjection[]>;
};

export type MediaItemProjection = {
  mediaItemId?: EntityId;
  mediaItemOwnerId?: EntityId;
  mediaItemKind?: string;
  mediaItemStatus?: string;
  mediaItemStorageKey?: string;
  mediaItemMimeType?: string;
  mediaItemSizeBytes?: number;
  mediaItemWidth?: number;
  mediaItemHeight?: number;
  mediaItemDurationSeconds?: number;
  mediaItemTitle?: string;
  mediaItemDescription?: string;
  mediaItemTakenAt?: Date;
};

type AlbumWithCoverProjection = {
  id: string;
  title: string;
  description?: string;
} & MediaItemProjection;

type AlbumItemWithMediaProjection = {
  id: EntityId;
} & MediaItemProjection;

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
  }: {
    viewerId: string;
  }): Promise<AlbumWithCoverProjection[]> => {
    return database<AlbumWithCoverProjection>('album')
      .innerJoin('albumMember', 'albumMember.albumId', 'album.id')
      .leftJoin('mediaItem', 'mediaItem.id', 'album.coverMediaId')
      .where('albumMember.userId', viewerId)
      .select<AlbumWithCoverProjection[]>(...albumWithCoverSelectColumns);
  },

  getAlbumForViewer: async ({
    albumId,
    viewerId,
  }: {
    albumId: string;
    viewerId: string;
  }): Promise<AlbumWithCoverProjection | undefined> => {
    const row = await database<AlbumWithCoverProjection>('album')
      .innerJoin('albumMember', 'albumMember.albumId', 'album.id')
      .leftJoin('mediaItem', 'mediaItem.id', 'album.coverMediaId')
      .where('albumMember.userId', viewerId)
      .andWhere('album.id', albumId)
      .first<AlbumWithCoverProjection>(...albumWithCoverSelectColumns);

    return row;
  },
  getAlbumItemsForViewer: async ({
    albumId,
    viewerId,
  }: {
    albumId: string;
    viewerId: string;
  }): Promise<AlbumItemWithMediaProjection[]> => {
    return database<AlbumItemWithMediaProjection>('albumItem')
      .innerJoin('album', 'albumItem.albumId', 'album.id')
      .innerJoin('albumMember', 'albumMember.albumId', 'album.id')
      .innerJoin('mediaItem', 'mediaItem.id', 'albumItem.mediaItemId')
      .where('albumMember.userId', viewerId)
      .andWhere('album.id', albumId)
      .select<AlbumItemWithMediaProjection[]>(...albumItemWithMediaSelectColumns);
  },
});
