import { MediaAssetKind, MediaAssetStatus } from '@packages/contracts';
import { withEnumRevival } from '@reharik/smart-enum-knex';
import type { Knex } from 'knex';
import { MediaAsset, type MediaAssetRecord } from '../../domain/MediaAsset/MediaAsset';
import type { EntityId } from '../../types/types';

export type MediaAssetRepository = {
  getFirstByMediaItemId: (mediaItemId: EntityId) => Promise<MediaAsset | undefined>;
  save: (asset: MediaAsset) => Promise<void>;
};

type MediaAssetRepositoryDeps = { database: Knex };

export const buildMediaAssetRepository = ({
  database,
}: MediaAssetRepositoryDeps): MediaAssetRepository => {
  const getFirstByMediaItemId = async (mediaItemId: EntityId): Promise<MediaAsset | undefined> => {
    const row = await withEnumRevival(
      database<MediaAssetRecord>('mediaAsset')
        .where({ mediaItemId })
        .orderBy('createdAt', 'asc')
        .first(),
      { kind: MediaAssetKind, status: MediaAssetStatus },
      { strict: true },
    );
    if (!row) {
      return;
    }
    return MediaAsset.rehydrate(row);
  };

  const getByMediaItemIdAndKind = async (
    mediaItemId: EntityId,
    kind: MediaAssetKind,
  ): Promise<MediaAsset | undefined> => {
    const row = await withEnumRevival(
      database<MediaAssetRecord>('mediaAsset').where({ mediaItemId, kind: kind.value }).first(),
      { kind: MediaAssetKind, status: MediaAssetStatus },
      { strict: true },
    );
    if (!row) {
      return;
    }
    return MediaAsset.rehydrate(row);
  };

  const save = async (asset: MediaAsset): Promise<void> => {
    const row = asset.toPersistence();
    const existing = await database<Pick<MediaAssetRecord, 'id'>>('mediaAsset')
      .where({ id: row.id })
      .first();

    if (existing) {
      const { id, ...updates } = row;
      await database<MediaAssetRecord>('mediaAsset').where({ id }).update(updates);
    } else {
      await database('mediaAsset').insert(row);
    }
  };

  return {
    getFirstByMediaItemId,
    getByMediaItemIdAndKind,
    save,
  };
};
