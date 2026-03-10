/**
 * AlbumMembership: association between a User and an Album with a role.
 * Permissions are derived from the role (viewer, contributor, admin).
 */

import type { Entity } from "./entity";
import type { User } from "./user";

export type AlbumMembershipRole = "viewer" | "contributor" | "admin";

export interface AlbumMembership extends Entity {
  user: User;
  role: AlbumMembershipRole;
}

/**
 * Data required to create an album membership. Id and timestamps are assigned by the system.
 */
export type AlbumMembershipCreate = Pick<AlbumMembership, "user" | "role">;
