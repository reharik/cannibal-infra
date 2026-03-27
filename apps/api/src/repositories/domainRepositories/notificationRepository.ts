import { IocGeneratedCradle } from "../../di/generated/ioc-registry.types";
import type { EntityId } from "../../types/types";
import { Notification } from "../../domain/Notification/Notification";
import type { NotificationRecord } from "../../domain/Notification/Notification";
import { rowToRecord } from "./rowToRecord";
import type { NotificationRepository as DomainNotificationRepository } from "../../domain/Notification/NotificationRepository";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NotificationRepository extends DomainNotificationRepository {}

export const buildNotificationRepository = ({
  database,
}: IocGeneratedCradle): NotificationRepository => {
  const getById = async (id: EntityId): Promise<Notification | undefined> => {
    const notificationRow = (await database("notification")
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

    const existing = (await database("notification")
      .where({ id: record.id })
      .first()) as Record<string, unknown> | undefined;

    if (existing) {
      await database("notification").where({ id: record.id }).update(record);
    } else {
      await database("notification").insert(record);
    }
  };

  return {
    getById,
    save,
  };
};
