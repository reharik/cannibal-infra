/**
 * User: application user identity.
 * Small Aggregate Root for identity/profile/account state only.
 * References other aggregates by ID only; does not own collections of albums, media, comments, or notifications.
 */

import { AggregateRoot } from "../AggregateRoot";
import type { ActorId, EntityId } from "../../types/types";
import type { EntityAuditRecord } from "../Entity";

export type UserProps = {
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
};

export type UserRecord = {
  id: EntityId;
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
} & EntityAuditRecord;

export type CreateUserInput = {
  email: string;
  firstName: string;
  lastName: string;
};

export class User extends AggregateRoot<UserRecord> {
  protected props: UserProps;

  private constructor(id: EntityId, actorId: ActorId, props: UserProps) {
    super(id, actorId);
    this.props = props;
  }

  static create(input: CreateUserInput, actorId: ActorId): User {
    return new User(crypto.randomUUID(), actorId, {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
    });
  }

  static rehydrate(record: UserRecord): User {
    const user = new User(record.id, record.createdBy, {
      email: record.email,
      firstName: record.firstName,
      lastName: record.lastName,
      phone: record.phone,
      addressLine1: record.addressLine1,
      addressLine2: record.addressLine2,
      city: record.city,
      postalCode: record.postalCode,
      state: record.state,
      country: record.country,
      passwordHash: record.passwordHash,
      lastLoginAt: record.lastLoginAt,
      emailVerified: record.emailVerified,
    });

    user.rehydrateAudit(record);

    return user;
  }

  rename(firstName: string, lastName: string, actorId: ActorId): void {
    this.props.firstName = firstName;
    this.props.lastName = lastName;
    this.touch(actorId);
  }

  updateEmail(email: string, actorId: ActorId): void {
    this.props.email = email;
    this.touch(actorId);
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
    actorId: ActorId,
  ): void {
    if (contact.phone !== undefined) this.props.phone = contact.phone;
    if (contact.addressLine1 !== undefined)
      this.props.addressLine1 = contact.addressLine1;
    if (contact.addressLine2 !== undefined)
      this.props.addressLine2 = contact.addressLine2;
    if (contact.city !== undefined) this.props.city = contact.city;
    if (contact.postalCode !== undefined)
      this.props.postalCode = contact.postalCode;
    if (contact.state !== undefined) this.props.state = contact.state;
    if (contact.country !== undefined) this.props.country = contact.country;
    this.touch(actorId);
  }

  recordLogin(actorId: ActorId): void {
    this.props.lastLoginAt = new Date();
    this.touch(actorId);
  }

  markEmailVerified(actorId: ActorId): void {
    this.props.emailVerified = true;
    this.touch(actorId);
  }
}
