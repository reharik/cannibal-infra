/**
 * Domain invariants and business rules. Enforcement is implemented in application
 * services that use the domain model.
 *
 * Relationships:
 * - User: owns many MediaItems and many Albums; can be member of Albums via AlbumMembership;
 *   receives Notifications.
 * - MediaItem: owned by one User (owner); can appear in many Albums via AlbumPhoto.
 * - Album: owned by one User (owner); contains many MediaItems via AlbumPhoto;
 *   has members via AlbumMembership; can be shared via ShareLink; can have Comments.
 * - AlbumPhoto: links one Album to one MediaItem; createdBy is who added it, createdAt when.
 * - AlbumMembership: links one User to one Album with a role (viewer, contributor, admin).
 * - ShareLink: grants token-based access to an Album or MediaItem (resource) with permissions and optional expiry.
 * - Comment: attached to an Album or MediaItem (resource); has an author.
 * - Notification: targets a user; records events like shares, comments, added media.
 *
 * Permissions:
 * - Ownership: Album.owner and MediaItem.owner denote full control.
 * - AlbumMembership.role: viewer (view only), contributor (view + add/remove media), admin (manage members + above).
 * - ShareLink.permissions: view, comment, contribute; anyone with the link token gets these until expiresAt.
 */

import type { AlbumMembershipRole } from "./albumMembership";
import type { ShareLinkPermission } from "./shareLink";

const ALBUM_MEMBERSHIP_ROLES: AlbumMembershipRole[] = [
  "viewer",
  "contributor",
  "admin",
];

const SHARE_LINK_PERMISSIONS: ShareLinkPermission[] = [
  "view",
  "comment",
  "contribute",
];

export const isValidAlbumMembershipRole = (
  role: string,
): role is AlbumMembershipRole =>
  (ALBUM_MEMBERSHIP_ROLES as string[]).includes(role);

export const isValidShareLinkPermission = (
  p: string,
): p is ShareLinkPermission => (SHARE_LINK_PERMISSIONS as string[]).includes(p);

export const shareLinkPermissionsSubsetOf = (
  permissions: ShareLinkPermission[],
): boolean => permissions.every((p) => isValidShareLinkPermission(p));
