/**
 * Domain invariants and business rules. Enforcement is implemented in application
 * services that use the domain model.
 *
 * Relationships:
 * - User: owns many MediaItems and many Albums; can be member of Albums via AlbumMember;
 *   receives Notifications.
 * - MediaItem: owned by one User (owner); can appear in many Albums via AlbumPhoto.
 * - Album: owned by one User (owner); contains many MediaItems via AlbumPhoto;
 *   has members via AlbumMember; can be shared via ShareLink; can have Comments.
 * - AlbumPhoto: links one Album to one MediaItem; createdBy is who added it, createdAt when.
 * - AlbumMember: links one User to one Album with a role (viewer, contributor, admin).
 * - ShareLink: grants token-based access to an Album or MediaItem (resource) with permissions and optional expiry.
 * - Comment: attached to an Album or MediaItem (resource); has an author.
 * - Notification: targets a user; records events like shares, comments, added media.
 *
 * Permissions:
 * - Ownership: Album.owner and MediaItem.owner denote full control.
 * - AlbumMember.role: viewer (view only), contributor (view + add/remove media), admin (manage members + above).
 * - ShareLink.permissions: view, comment, contribute; anyone with the link token gets these until expiresAt.
 */

import {
  AlbumMemberRoleEnum,
  ShareLinkPermissionEnum,
} from "@photo-app/contracts";

export const parseAlbumMemberRole = (
  role: string,
): AlbumMemberRoleEnum | undefined =>
  AlbumMemberRoleEnum.tryFromValue(role) ?? undefined;

export const parseShareLinkPermission = (
  p: string,
): ShareLinkPermissionEnum | undefined =>
  ShareLinkPermissionEnum.tryFromValue(p) ?? undefined;

export const shareLinkPermissionsSubsetOf = (
  permissions: (string | ShareLinkPermissionEnum)[],
): boolean =>
  permissions.every((p) =>
    typeof p === "string"
      ? parseShareLinkPermission(p) != null
      : ShareLinkPermissionEnum.tryFromValue(p.value) != null,
  );
