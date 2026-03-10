/**
 * User: application user identity.
 * Includes person-type fields (address, phone) and auth-related fields (passwordHash, lastLoginAt)
 * for login; auth/contracts may expose a subset for API responses.
 */

import type { Album } from "./album";
import type { Entity } from "./entity";
import type { MediaItem } from "./mediaItem";
import type { Notification } from "./notification";

export interface User extends Entity {
  email: string;
  firstName: string;
  lastName: string;

  /** Person-type: contact and address (all optional). */
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;

  /** Auth: used for login; omit when returning user to client. */
  passwordHash?: string;
  /** Auth: last successful login. */
  lastLoginAt?: Date;
  /** Auth: whether email has been verified. */
  emailVerified?: boolean;

  /** Albums owned by this user (optional; present when relations are loaded). */
  albums?: Album[];
  /** Media items owned by this user (optional; present when relations are loaded). */
  mediaItems?: MediaItem[];
  /** Notifications for this user (optional; present when relations are loaded). */
  notifications?: Notification[];
}

/**
 * Data required to create a user. Id and timestamps are assigned by the system.
 */
export type UserCreate = Pick<User, "email" | "firstName" | "lastName">;
