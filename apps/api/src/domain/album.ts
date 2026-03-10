/**
 * Album: collection of media items with an owner.
 * Members are expressed via AlbumMembership; sharing via ShareLink.
 */

import type { AlbumMediaItem } from "./albumMediaItem";
import type { AlbumMembership } from "./albumMembership";
import type { Comment } from "./comment";
import type { Entity } from "./entity";
import type { ShareLink } from "./shareLink";
import type { User } from "./user";

export interface Album extends Entity {
  owner: User;
  title: string;
  /** Members of this album (optional; present when relations are loaded). */
  memberships?: AlbumMembership[];
  /** Media items in this album (optional; present when relations are loaded). */
  albumMediaItems?: AlbumMediaItem[];
  /** Comments on this album (optional; present when relations are loaded). */
  comments?: Comment[];
  /** Share links for this album (optional; present when relations are loaded). */
  shareLinks?: ShareLink[];
}

/**
 * Data required to create an album. Id and timestamps are assigned by the system.
 */
export type AlbumCreate = Pick<Album, "owner" | "title">;
