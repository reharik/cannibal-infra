/**
 * Notification: user-facing event record for shares, comments, added media, etc.
 * Aggregate Root with its own lifecycle; references recipient (and optional resource) by ID only.
 */

import { AggregateRoot } from "./AggregateRoot";
import type { EntityAuditRecord } from "./Entity";
import type { ActorId, EntityId } from "../types/types";
import type { NotificationKindEnum } from "@packages/contracts";
import { NotificationKindEnum as NotificationKindEnumCollection } from "@packages/contracts";

export type NotificationProps = {
  recipientId: EntityId;
  kind: NotificationKindEnum;
  title: string;
  body: string;
  readAt?: Date;
};

export type NotificationRecord = {
  id: EntityId;
  recipientId: EntityId;
  kind: string;
  title: string;
  body: string;
  readAt?: Date;
} & EntityAuditRecord;

export type CreateNotificationInput = {
  recipientId: EntityId;
  kind: NotificationKindEnum;
  title: string;
  body: string;
};

export class Notification extends AggregateRoot<NotificationRecord> {
  protected props: NotificationProps;

  private constructor(
    id: EntityId,
    actorId: ActorId,
    props: NotificationProps,
  ) {
    super(id, actorId);
    this.props = props;
  }

  static create(
    input: CreateNotificationInput,
    actorId: ActorId,
  ): Notification {
    return new Notification(crypto.randomUUID(), actorId, {
      recipientId: input.recipientId,
      kind: input.kind,
      title: input.title,
      body: input.body,
    });
  }

  static rehydrate(record: NotificationRecord): Notification {
    const notification = new Notification(record.id, record.createdBy, {
      recipientId: record.recipientId,
      kind: NotificationKindEnumCollection.fromValue(record.kind),
      title: record.title,
      body: record.body,
      readAt: record.readAt,
    });

    notification.rehydrateAudit(record);

    return notification;
  }

  markAsRead(actorId: ActorId): void {
    this.props.readAt = new Date();
    this.touch(actorId);
  }
}
