import { ShareLinkPermissionEnum } from '@packages/contracts';
import { withEnumRevival } from '@reharik/smart-enum-knex';
import type { Knex } from 'knex';
import { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';
import type { ShareLinkRecord } from '../../domain/ShareLink/ShareLink';
import { ShareLink } from '../../domain/ShareLink/ShareLink';
import type { ShareLinkRepository as DomainShareLinkRepository } from '../../domain/ShareLink/ShareLinkRepository';
import type { EntityId } from '../../types/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ShareLinkRepository extends DomainShareLinkRepository {}

export const buildShareLinkRepository = ({ database }: IocGeneratedCradle): ShareLinkRepository => {
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
