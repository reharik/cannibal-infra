import type { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';
import { MediaItemParent } from '../../graphql/resolvers/parentModels';
import { EntityId } from '../../types/types';

export type MediaItemReadRepository = {
  getForViewer: ({
    mediaItemId,
    viewerId,
  }: {
    mediaItemId: EntityId;
    viewerId: EntityId;
  }) => Promise<MediaItemParent | undefined>;
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
  getForViewer: async ({
    mediaItemId,
    viewerId,
  }: {
    mediaItemId: EntityId;
    viewerId: EntityId;
  }): Promise<MediaItemParent | undefined> => {
    const row = await database<MediaItemParent>('mediaItem')
      .where({ id: mediaItemId, ownerId: viewerId })
      .first<MediaItemParent>(...mediaItemRowFields);

    return row;
  },
});
