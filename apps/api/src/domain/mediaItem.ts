/**
 * MediaItem: uploaded media asset (photo or video) owned by a user, with media metadata.
 * A media item can appear in multiple albums via AlbumPhoto.
 */

import type { MediaItemKindEnum } from "@photo-app/contracts";
import type { Comment } from "./comment";
import type { Entity } from "./entity";
import type { ShareLink } from "./shareLink";
import type { User } from "./user";

export interface MediaItem extends Entity {
  owner: User;
  kind: MediaItemKindEnum;
  storageKey: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  title?: string;
  description?: string;
  takenAt?: Date;
  /** Comments on this media item (optional; present when relations are loaded). */
  comments?: Comment[];
  /** Share links for this media item (optional; present when relations are loaded). */
  shareLinks?: ShareLink[];
}

/**
 * Data required to create a media item. Id and timestamps are assigned by the system.
 */
export type MediaItemCreate = Pick<
  MediaItem,
  | "owner"
  | "kind"
  | "storageKey"
  | "mimeType"
  | "size"
  | "width"
  | "height"
  | "durationSeconds"
  | "title"
  | "description"
  | "takenAt"
>;
