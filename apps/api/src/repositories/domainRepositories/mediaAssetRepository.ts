import { MediaAssetKind, MediaAssetStatus } from '@packages/contracts';
import { withEnumRevival } from '@reharik/smart-enum-knex';
import { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';
import { MediaAsset, type MediaAssetRecord } from '../../domain/MediaAsset/MediaAsset';
import type { MediaAssetRepository as DomainMediaAssetRepository } from '../../domain/MediaAsset/MediaAssetRepository';
import type { EntityId } from '../../types/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface MediaAssetRepository extends DomainMediaAssetRepository {}

export const buildMediaAssetRepository = ({ database }: IocGeneratedCradle): MediaAssetRepository => {
  const getFirstByMediaItemId = async (mediaItemId: EntityId): Promise<MediaAsset | undefined> => {
    const row = await withEnumRevival(
      database<MediaAssetRecord>('mediaAsset').where({ mediaItemId }).orderBy('createdAt', 'asc').first(),
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
    const existing = await database<Pick<MediaAssetRecord, 'id'>>('mediaAsset').where({ id: row.id }).first();

    if (existing) {
      const updates = { ...row };
      delete updates.id;
      await database<MediaAssetRecord>('mediaAsset').where({ id: row.id }).update(updates);
    } else {
      await database('mediaAsset').insert(row);
    }
  };

  return {
    getFirstByMediaItemId,
    save,
  };
};
