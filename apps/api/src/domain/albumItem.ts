/**
 * AlbumItem: association between an Album and a MediaItem.
 * createdBy is the user who added the media item; createdAt is when it was added.
 */

import type { Entity } from "./entity";
import type { MediaItem } from "./mediaItem";

export interface AlbumItem extends Entity {
  mediaItem: MediaItem;
}

/**
 * Data required to create an album item link. Id and timestamps are assigned by the system.
 */
export type AlbumItemCreate = Pick<AlbumItem, "mediaItem">;
