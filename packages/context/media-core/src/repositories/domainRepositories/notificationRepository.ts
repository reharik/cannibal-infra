import { NotificationKindEnum } from '@packages/contracts';
import { withEnumRevival } from '@reharik/smart-enum-knex';
import type { Knex } from 'knex';
import type { NotificationRecord } from '../../domain/Notification/Notification';
import { Notification } from '../../domain/Notification/Notification';
import type { EntityId } from '../../types/types';

export type NotificationRepository = {
  getById: (id: EntityId) => Promise<Notification | undefined>;
  save: (notification: Notification) => Promise<void>;
};

type NotificationRepositoryDeps = { database: Knex };

export const buildNotificationRepository = ({
  database,
}: NotificationRepositoryDeps): NotificationRepository => {
  const getById = async (id: EntityId): Promise<Notification | undefined> => {
    const notificationRow = await withEnumRevival(
      database<NotificationRecord>('notification').where({ id }).first(),
      { notificationKind: NotificationKindEnum },
      { strict: true },
    );

    if (!notificationRow) {
      return;
    }

    return Notification.rehydrate(notificationRow);
  };

  const save = async (notification: Notification): Promise<void> => {
    const record = notification.toPersistence();

    const existing = await database<NotificationRecord>('notification')
      .where({ id: record.id })
      .first();

    if (existing) {
      await database<NotificationRecord>('notification').where({ id: record.id }).update(record);
    } else {
      await database<NotificationRecord>('notification').insert(record);
    }
  };

  return {
    getById,
    save,
  };
};
