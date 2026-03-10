/**
 * Notification: user-facing event record for shares, comments, added media, etc.
 */

import type { NotificationKindEnum } from "@photo-app/contracts";
import type { Entity } from "./entity";

export interface Notification extends Entity {
  kind: NotificationKindEnum;
  title: string;
  body: string;
  readAt?: Date;
}

/**
 * Data required to create a notification. Id and timestamps are assigned by the system.
 */
export type NotificationCreate = Pick<Notification, "kind" | "title" | "body">;
