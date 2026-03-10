/**
 * ShareLink: token-based sharing for an Album or MediaItem with permissions and optional expiration.
 */

import type { Entity } from "./entity";

export type ShareLinkPermission = "view" | "comment" | "contribute";

export interface ShareLink extends Entity {
  resourceType: "album" | "mediaItem";
  linkToken: string;
  permissions: ShareLinkPermission[];
  expiresAt?: Date;
}

/**
 * Data required to create a share link. Id and timestamps are assigned by the system.
 */
export type ShareLinkCreate = Pick<
  ShareLink,
  "resourceType" | "linkToken" | "permissions" | "expiresAt"
>;
