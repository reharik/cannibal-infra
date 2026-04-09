import type { EntityId } from '../../types/types';
import type { MediaAsset } from '../MediaAsset/MediaAsset';
import type { MediaItem } from './MediaItem';

export type MediaItemRepository = {
  getById: (id: EntityId) => Promise<MediaItem | undefined>;
  save: (mediaItem: MediaItem) => Promise<void>;
  saveNewWithInitialAsset: (mediaItem: MediaItem, initialAsset: MediaAsset) => Promise<void>;
};
