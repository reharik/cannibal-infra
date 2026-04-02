import { MediaItemStatus, MediaKind } from '@packages/contracts';
import { withEnumRevival } from '@reharik/smart-enum-knex';
import type { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';
import { EntityId } from '../../types/types';

export type MediaItemReadRepository = {
  getCoverMediaByAlbumIdForViewer: ({
    albumId,
    viewerId,
  }: {
    albumId: string;
    viewerId: EntityId;
  }) => Promise<MediaItemRow | undefined>;
  getForViewer: ({
    mediaItemId,
    viewerId,
  }: {
    mediaItemId: EntityId;
    viewerId: EntityId;
  }) => Promise<MediaItemRow | undefined>;
};

type MediaItemRow = {
  id: string;
  ownerId: string;
  kind: MediaKind;
  status: MediaItemStatus;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  title?: string;
  description?: string;
  takenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
};

const mediaItemRowFields = [
  'media_item.id',
  'media_item.ownerId',
  'media_item.kind',
  'media_item.status',
  'media_item.storageKey',
  'media_item.mimeType',
  'media_item.sizeBytes',
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
  getCoverMediaByAlbumIdForViewer: async ({
    albumId,
    viewerId,
  }: {
    albumId: string;
    viewerId: EntityId;
  }): Promise<MediaItemRow | undefined> => {
    const row = await withEnumRevival(
      database<MediaItemRow>('mediaItem')
        .innerJoin('album', 'album.coverMediaId', 'mediaItem.id')
        .where({ id: albumId, ownerId: viewerId })
        .first<MediaItemRow>(...mediaItemRowFields),
      { mediaItem: MediaKind, mediaItemStatus: MediaItemStatus },
      { strict: true },
    );

    return row;
  },

  getForViewer: async ({
    mediaItemId,
    viewerId,
  }: {
    mediaItemId: EntityId;
    viewerId: EntityId;
  }): Promise<MediaItemRow | undefined> => {
    const row = await withEnumRevival(
      database<MediaItemRow>('mediaItem')
        .where({ id: mediaItemId, ownerId: viewerId })
        .first<MediaItemRow>(...mediaItemRowFields),
      { mediaItem: MediaKind, mediaItemStatus: MediaItemStatus },
      { strict: true },
    );

    return row;
  },
});
