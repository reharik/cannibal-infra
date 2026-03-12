/**
 * Notification: user-facing event record for shares, comments, added media, etc.
 */

import type { NotificationKindEnum } from "@app/contracts";
import { Entity, generateId, type AuditUser } from "./Entity";

export interface NotificationCreate {
  kind: NotificationKindEnum;
  title: string;
  body: string;
}

export interface NotificationRehydrate {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: AuditUser;
  updatedBy: AuditUser;
  kind: NotificationKindEnum;
  title: string;
  body: string;
  readAt?: Date;
}

export class Notification extends Entity<AuditUser> {
  #kind: NotificationKindEnum;
  #title: string;
  #body: string;
  #readAt: Date | undefined;

  private constructor(
    id: string,
    kind: NotificationKindEnum,
    title: string,
    body: string,
    readAt: Date | undefined,
    audit:
      | { actor: AuditUser }
      | {
          createdAt: Date;
          updatedAt: Date;
          createdBy: AuditUser;
          updatedBy: AuditUser;
        },
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
    this.#kind = kind;
    this.#title = title;
    this.#body = body;
    this.#readAt = readAt;
  }

  static create(input: NotificationCreate, actor: AuditUser): Notification {
    return new Notification(
      generateId(),
      input.kind,
      input.title,
      input.body,
      undefined,
      { actor },
    );
  }

  static rehydrate(data: NotificationRehydrate): Notification {
    return new Notification(
      data.id,
      data.kind,
      data.title,
      data.body,
      data.readAt,
      {
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
      },
    );
  }

  get kind(): NotificationKindEnum {
    return this.#kind;
  }

  get title(): string {
    return this.#title;
  }

  get body(): string {
    return this.#body;
  }

  get readAt(): Date | undefined {
    return this.#readAt;
  }

  markAsRead(actor: AuditUser): void {
    this.#readAt = new Date();
    this.touch(actor);
  }
}
