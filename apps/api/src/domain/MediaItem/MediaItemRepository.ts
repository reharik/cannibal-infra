import type { EntityId } from "../../types/types";
import type { MediaItem } from "./MediaItem";

export type MediaItemRepository = {
  getById: (id: EntityId) => Promise<MediaItem | undefined>;
  save: (mediaItem: MediaItem) => Promise<void>;
};
