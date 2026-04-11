import { ShareLinkPermissionEnum } from '@packages/contracts';
import { withEnumRevival } from '@reharik/smart-enum-knex';
import type { Knex } from 'knex';
import type { ShareLinkRecord } from '../../domain/ShareLink/ShareLink';
import { ShareLink } from '../../domain/ShareLink/ShareLink';
import type { EntityId } from '../../types/types';

export type ShareLinkRepository = {
  getById: (id: EntityId) => Promise<ShareLink | undefined>;
  save: (shareLink: ShareLink, albumId: EntityId) => Promise<void>;
};

type ShareLinkRepositoryDeps = { database: Knex };

export const buildShareLinkRepository = ({
  database,
}: ShareLinkRepositoryDeps): ShareLinkRepository => {
  const getById = async (id: EntityId): Promise<ShareLink | undefined> => {
    const shareLinkRow = await withEnumRevival(
      database<ShareLinkRecord>('shareLink').where({ id }).first(),
      { permission: ShareLinkPermissionEnum },
      { strict: true },
    );

    if (!shareLinkRow) {
      return;
    }

    return ShareLink.rehydrate(shareLinkRow);
  };

  const save = async (shareLink: ShareLink, albumId: EntityId): Promise<void> => {
    const record = shareLink.toPersistence();
    const row = { ...record, albumId };

    await database.transaction(async (trx: Knex.Transaction) => {
      const existing = await trx<ShareLinkRecord>('shareLink').where({ id: record.id }).first();

      if (existing) {
        await trx<ShareLinkRecord>('shareLink').where({ id: record.id }).update(row);
      } else {
        await trx<ShareLinkRecord>('shareLink').insert(row);
      }
    });
  };

  return {
    getById,
    save,
  };
};
