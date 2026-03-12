/**
 * User: application user identity.
 * Encapsulates person-type and auth-related state; mutations via explicit methods.
 */

import type { Album } from "./album";
import { Entity, generateId } from "./Entity";
import type { MediaItem } from "./mediaItem";
import type { Notification } from "./notification";

export interface UserCreate {
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserRehydrate {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: User;
  updatedBy: User;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  country?: string;
  passwordHash?: string;
  lastLoginAt?: Date;
  emailVerified?: boolean;
  albums?: readonly Album[];
  mediaItems?: readonly MediaItem[];
  notifications?: readonly Notification[];
}

export class User extends Entity<User> {
  #email: string;
  #firstName: string;
  #lastName: string;
  #phone: string | undefined;
  #addressLine1: string | undefined;
  #addressLine2: string | undefined;
  #city: string | undefined;
  #postalCode: string | undefined;
  #state: string | undefined;
  #country: string | undefined;
  #passwordHash: string | undefined;
  #lastLoginAt: Date | undefined;
  #emailVerified: boolean | undefined;
  #albums: Album[] = [];
  #mediaItems: MediaItem[] = [];
  #notifications: Notification[] = [];

  private constructor(
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    phone: string | undefined,
    addressLine1: string | undefined,
    addressLine2: string | undefined,
    city: string | undefined,
    postalCode: string | undefined,
    state: string | undefined,
    country: string | undefined,
    passwordHash: string | undefined,
    lastLoginAt: Date | undefined,
    emailVerified: boolean | undefined,
    albums: Album[],
    mediaItems: MediaItem[],
    notifications: Notification[],
    audit:
      | { actor: User }
      | { createdAt: Date; updatedAt: Date; createdBy: User; updatedBy: User },
  ) {
    if ("actor" in audit) {
      super(id, audit.actor);
    } else {
      super(
        id,
        audit.createdAt,
        audit.updatedAt,
        audit.createdBy,
        audit.updatedBy,
      );
    }
    this.#email = email;
    this.#firstName = firstName;
    this.#lastName = lastName;
    this.#phone = phone;
    this.#addressLine1 = addressLine1;
    this.#addressLine2 = addressLine2;
    this.#city = city;
    this.#postalCode = postalCode;
    this.#state = state;
    this.#country = country;
    this.#passwordHash = passwordHash;
    this.#lastLoginAt = lastLoginAt;
    this.#emailVerified = emailVerified;
    this.#albums = [...albums];
    this.#mediaItems = [...mediaItems];
    this.#notifications = [...notifications];
  }

  static create(input: UserCreate, actor: User): User {
    return new User(
      generateId(),
      input.email,
      input.firstName,
      input.lastName,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      [],
      [],
      [],
      { actor },
    );
  }

  static rehydrate(data: UserRehydrate): User {
    return new User(
      data.id,
      data.email,
      data.firstName,
      data.lastName,
      data.phone,
      data.addressLine1,
      data.addressLine2,
      data.city,
      data.postalCode,
      data.state,
      data.country,
      data.passwordHash,
      data.lastLoginAt,
      data.emailVerified,
      data.albums ? [...data.albums] : [],
      data.mediaItems ? [...data.mediaItems] : [],
      data.notifications ? [...data.notifications] : [],
      {
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
      },
    );
  }

  get email(): string {
    return this.#email;
  }

  get firstName(): string {
    return this.#firstName;
  }

  get lastName(): string {
    return this.#lastName;
  }

  get phone(): string | undefined {
    return this.#phone;
  }

  get lastLoginAt(): Date | undefined {
    return this.#lastLoginAt;
  }

  get emailVerified(): boolean | undefined {
    return this.#emailVerified;
  }

  get albums(): readonly Album[] {
    return [...this.#albums];
  }

  get mediaItems(): readonly MediaItem[] {
    return [...this.#mediaItems];
  }

  get notifications(): readonly Notification[] {
    return [...this.#notifications];
  }

  rename(firstName: string, lastName: string, actor: User): void {
    this.#firstName = firstName;
    this.#lastName = lastName;
    this.touch(actor);
  }

  updateEmail(email: string, actor: User): void {
    this.#email = email;
    this.touch(actor);
  }

  updateContactInfo(
    contact: {
      phone?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      postalCode?: string;
      state?: string;
      country?: string;
    },
    actor: User,
  ): void {
    if (contact.phone !== undefined) this.#phone = contact.phone;
    if (contact.addressLine1 !== undefined)
      this.#addressLine1 = contact.addressLine1;
    if (contact.addressLine2 !== undefined)
      this.#addressLine2 = contact.addressLine2;
    if (contact.city !== undefined) this.#city = contact.city;
    if (contact.postalCode !== undefined) this.#postalCode = contact.postalCode;
    if (contact.state !== undefined) this.#state = contact.state;
    if (contact.country !== undefined) this.#country = contact.country;
    this.touch(actor);
  }

  recordLogin(actor: User): void {
    this.#lastLoginAt = new Date();
    this.touch(actor);
  }

  markEmailVerified(actor: User): void {
    this.#emailVerified = true;
    this.touch(actor);
  }
}
