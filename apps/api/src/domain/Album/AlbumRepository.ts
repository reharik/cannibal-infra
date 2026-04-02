import type { EntityId } from '../../types/types';
import type { Album } from './Album';

export type AlbumRepository = {
  getById: (id: EntityId) => Promise<Album | undefined>;
  save: (album: Album) => Promise<void>;
};
