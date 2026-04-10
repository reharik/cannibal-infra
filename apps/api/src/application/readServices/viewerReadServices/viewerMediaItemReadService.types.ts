import { MediaItemSortBy, SortDir } from '@packages/contracts';
import { PageInfo } from 'apps/api/src/graphql/generated/types.generated';
import { CollectionInfo, EntityId } from 'apps/api/src/types/types';

export type MediaItemListProjection = {
  nodes: MediaItemProjection[];
  pageInfo: PageInfo;
};

export type MediaAssetProjection = {
  id: EntityId;
  kind: string;
  url: string;
  mimeType: string;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MediaItemRow = {
  id: EntityId;
  ownerId: EntityId;
  storageKey: string;
  kind: string;
  status: string;
  mimeType?: string;
  sizeBytes?: number;
  originalFileName?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  title?: string;
  description?: string;
  takenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type MediaItemProjection = MediaItemRow & {
  assets?: MediaAssetProjection[];
};

export interface MediaItemCollectionInfo extends CollectionInfo<MediaItemSortBy> {
  pageInfo: PageInfo;
  sortBy: MediaItemSortBy;
  sortDir: SortDir;
}
