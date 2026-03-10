/**
 * AlbumMember: association between a User and an Album with a role.
 * Permissions are derived from the role (viewer, contributor, admin).
 */

import type { AlbumMemberRoleEnum } from "@photo-app/contracts";
import type { Entity } from "./entity";
import type { User } from "./user";

export interface AlbumMember extends Entity {
  user: User;
  role: AlbumMemberRoleEnum;
}

/**
 * Data required to create an album member. Id and timestamps are assigned by the system.
 */
export type AlbumMemberCreate = Pick<AlbumMember, "user" | "role">;
