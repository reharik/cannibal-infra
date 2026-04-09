import type { EntityId } from '../../types/types';
import type { MediaAsset } from './MediaAsset';

export type MediaAssetRepository = {
  getFirstByMediaItemId: (mediaItemId: EntityId) => Promise<MediaAsset | undefined>;
  save: (asset: MediaAsset) => Promise<void>;
};
