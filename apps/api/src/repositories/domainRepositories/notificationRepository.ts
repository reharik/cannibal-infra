import { RESOLVER } from "awilix";
import { Container } from "../../container";
import type { EntityId } from "../../types/types";
import { Notification } from "../../domain/Notification/Notification";
import type { NotificationRecord } from "../../domain/Notification/Notification";
import { rowToRecord } from "./rowToRecord";
import type { NotificationRepository as DomainNotificationRepository } from "../../domain/Notification/NotificationRepository";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NotificationRepository extends DomainNotificationRepository {}

export const buildNotificationRepository = ({
  connection,
}: Container): NotificationRepository => {
  const getById = async (id: EntityId): Promise<Notification | undefined> => {
    const notificationRow = (await connection("notification")
      .where({ id })
      .first()) as Record<string, unknown> | undefined;

    if (!notificationRow) {
      return;
    }

    const record = rowToRecord<NotificationRecord>(notificationRow);
    return Notification.rehydrate(record);
  };

  const save = async (notification: Notification): Promise<void> => {
    const record = notification.toPersistence();

    const existing = (await connection("notification")
      .where({ id: record.id })
      .first()) as Record<string, unknown> | undefined;

    if (existing) {
      await connection("notification").where({ id: record.id }).update(record);
    } else {
      await connection("notification").insert(record);
    }
  };

  return {
    getById,
    save,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(buildNotificationRepository as any)[RESOLVER] = {};
