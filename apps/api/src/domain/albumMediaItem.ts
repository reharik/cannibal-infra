/**
 * AlbumPhoto: association between an Album and a MediaItem.
 * createdBy is the user who added the media item; createdAt is when it was added.
 */

import type { Entity } from "./entity";
import type { MediaItem } from "./mediaItem";

export interface AlbumMediaItem extends Entity {
  mediaItem: MediaItem;
}

/**
 * Data required to create an album photo link. Id and timestamps are assigned by the system.
 */
export type AlbumMediaItemCreate = Pick<AlbumMediaItem, "mediaItem">;
