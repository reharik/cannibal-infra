import { EntityId } from 'apps/api/src/types/types';

export type CreateAlbumCommand = {
  viewerId: string;
  title: string;
  description?: string;
};

export type CreateAlbumResult = {
  albumId: EntityId;
};

export type AddAlbumItemCommand = {
  viewerId: EntityId;
  albumId: EntityId;
  mediaItemId: EntityId;
};

export type AddAlbumItemResult = {
  albumId: EntityId;
  albumItemId: EntityId;
};
