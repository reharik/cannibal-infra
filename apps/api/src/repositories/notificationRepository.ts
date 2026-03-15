import type { Knex } from "knex";
import type { EntityId } from "../types/types";
import { Notification } from "../domain/Notification/Notification";
import type { NotificationRecord } from "../domain/Notification/Notification";
import type { NotificationRepository } from "../domain/Notification/NotificationRepository";
import { rowToRecord } from "./rowToRecord";

export const createNotificationRepository = (
  connection: Knex,
): NotificationRepository => {
  const getById = async (id: EntityId): Promise<Notification | null> => {
    const notificationRow = (await connection("notification")
      .where({ id })
      .first()) as Record<string, unknown> | undefined;

    if (!notificationRow) {
      return null;
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
      await connection("notification")
        .where({ id: record.id })
        .update(record);
    } else {
      await connection("notification").insert(record);
    }
  };

  return {
    getById,
    save,
  };
};
