/**
 * Notification: user-facing event record for shares, comments, added media, etc.
 */

import type { Entity } from "./entity";

export type NotificationKind =
  | "share_invite"
  | "album_shared"
  | "media_added"
  | "comment"
  | "comment_reply";

export interface Notification extends Entity {
  kind: NotificationKind;
  title: string;
  body: string;
  readAt?: Date;
}

/**
 * Data required to create a notification. Id and timestamps are assigned by the system.
 */
export type NotificationCreate = Pick<Notification, "kind" | "title" | "body">;
