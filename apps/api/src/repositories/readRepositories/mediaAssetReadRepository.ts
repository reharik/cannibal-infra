import type { MediaAssetProjection } from '../../application/readServices/viewerReadServices/viewerMediaItemReadService.types';
import type { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';
import type { EntityId } from '../../types/types';

type MediaAssetRow = {
  id: EntityId;
  mediaItemId: EntityId;
  kind: string;
  mimeType: string;
  width?: number;
  height?: number;
  fileSizeBytes?: number | string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MediaAssetReadRepository = {
  listByMediaItemIds: (mediaItemIds: EntityId[]) => Promise<Map<EntityId, MediaAssetProjection[]>>;
};

const toProjection = (row: MediaAssetRow): MediaAssetProjection => ({
  id: row.id,
  kind: row.kind,
  url: '',
  mimeType: row.mimeType,
  width: row.width,
  height: row.height,
  fileSizeBytes:
    row.fileSizeBytes === undefined || row.fileSizeBytes === null
      ? undefined
      : typeof row.fileSizeBytes === 'string'
        ? Number(row.fileSizeBytes)
        : row.fileSizeBytes,
  status: row.status,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const buildMediaAssetReadRepository = ({
  database,
}: IocGeneratedCradle): MediaAssetReadRepository => ({
  listByMediaItemIds: async (mediaItemIds: EntityId[]): Promise<Map<EntityId, MediaAssetProjection[]>> => {
    const unique = [...new Set(mediaItemIds)];
    if (unique.length === 0) {
      return new Map();
    }

    const rows = await database<MediaAssetRow>('mediaAsset')
      .whereIn('mediaItemId', unique)
      .orderBy('createdAt', 'asc');

    const map = new Map<EntityId, MediaAssetProjection[]>();
    for (const row of rows) {
      const list = map.get(row.mediaItemId) ?? [];
      list.push(toProjection(row));
      map.set(row.mediaItemId, list);
    }
    return map;
  },
});
