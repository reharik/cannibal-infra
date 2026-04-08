import { MediaItemSortBy, SortDir } from '@packages/contracts';
import { PageInfo } from 'apps/api/src/graphql/generated/types.generated';
import { CollectionInfo, EntityId } from 'apps/api/src/types/types';

export type MediaItemListProjection = {
  nodes: MediaItemProjection[];
  pageInfo: PageInfo;
};

export type MediaItemProjection = MediaItemRow;

export type MediaItemRow = {
  id: EntityId;
  ownerId: EntityId;
  kind: string;
  status: string;
  storageKey: string;
  mimeType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  title?: string;
  description?: string;
  takenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export interface MediaItemCollectionInfo extends CollectionInfo<MediaItemSortBy> {
  pageInfo: PageInfo;
  sortBy: MediaItemSortBy;
  sortDir: SortDir;
}
