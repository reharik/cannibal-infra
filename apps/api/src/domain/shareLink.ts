/**
 * ShareLink: token-based sharing for an Album or MediaItem with permissions and optional expiration.
 */

import type {
  ResourceTypeEnum,
  ShareLinkPermissionEnum,
} from "@photo-app/contracts";
import type { Entity } from "./entity";

export interface ShareLink extends Entity {
  resourceType: ResourceTypeEnum;
  linkToken: string;
  permissions: ShareLinkPermissionEnum[];
  expiresAt?: Date;
}

/**
 * Data required to create a share link. Id and timestamps are assigned by the system.
 */
export type ShareLinkCreate = Pick<
  ShareLink,
  "resourceType" | "linkToken" | "permissions" | "expiresAt"
>;
