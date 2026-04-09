import { AlbumItemSortBy, AlbumSortBy, SortDir } from '@packages/contracts';
import type { PageInfo } from 'apps/api/src/graphql/generated/types.generated';
import { CollectionInfo, EntityId } from 'apps/api/src/types/types';
import { MediaItemProjection } from './viewerMediaItemReadService.types';

export type AlbumListProjection = {
  nodes: AlbumProjection[];
  pageInfo: PageInfo;
};

export type AlbumItemListProjection = {
  nodes: AlbumItemProjection[];
  pageInfo: PageInfo;
};

export type AlbumProjection = {
  id: string;
  title: string;
  description?: string;
  coverMediaId?: string;
  coverMedia?: MediaItemProjection;
  createdAt: Date;
  updatedAt: Date;
};

export type AlbumItemProjection = {
  id: string;
  mediaItem: MediaItemProjection;
  createdAt: Date;
  updatedAt: Date;
};

export type NamespacedMediaItemRow = {
  mediaItemId: EntityId | null;
  mediaItemOwnerId: EntityId | null;
  mediaItemStorageKey: string | null;
  mediaItemKind: string | null;
  mediaItemStatus: string | null;
  mediaItemMimeType?: string | null;
  mediaItemSizeBytes?: number | null;
  mediaItemWidth?: number | null;
  mediaItemHeight?: number | null;
  mediaItemDurationSeconds?: number | null;
  mediaItemTitle?: string | null;
  mediaItemDescription?: string | null;
  mediaItemTakenAt?: Date | null;
  mediaItemCreatedAt: Date | null;
  mediaItemUpdatedAt: Date | null;
};

export type AlbumWithCoverRow = {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
} & NamespacedMediaItemRow;

export type AlbumItemWithMediaRow = {
  id: EntityId;
  createdAt: Date;
  updatedAt: Date;
} & NamespacedMediaItemRow;

export interface AlbumCollectionInfo extends CollectionInfo<AlbumSortBy> {
  pageInfo: PageInfo;
  sortBy: AlbumSortBy;
  sortDir: SortDir;
}

export interface AlbumItemCollectionInfo extends CollectionInfo<AlbumItemSortBy> {
  pageInfo: PageInfo;
  sortBy: AlbumItemSortBy;
  sortDir: SortDir;
}
