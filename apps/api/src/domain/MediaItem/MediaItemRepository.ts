import type { EntityId } from "../../types/types";
import type { MediaItem } from "./MediaItem";

export type MediaItemRepository = {
  getById: (id: EntityId) => Promise<MediaItem | null>;
  save: (mediaItem: MediaItem) => Promise<void>;
};
