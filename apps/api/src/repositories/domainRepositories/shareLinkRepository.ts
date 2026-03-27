import type { Knex } from "knex";
import type { EntityId } from "../../types/types";
import { ShareLink } from "../../domain/ShareLink/ShareLink";
import type { ShareLinkRecord } from "../../domain/ShareLink/ShareLink";
import { rowToRecord } from "./rowToRecord";
import { IocGeneratedCradle } from "../../di/generated/ioc-registry.types";
import type { ShareLinkRepository as DomainShareLinkRepository } from "../../domain/ShareLink/ShareLinkRepository";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ShareLinkRepository extends DomainShareLinkRepository {}

export const buildShareLinkRepository = ({
  database,
}: IocGeneratedCradle): ShareLinkRepository => {
  const getById = async (id: EntityId): Promise<ShareLink | undefined> => {
    const shareLinkRow = (await database("shareLink").where({ id }).first()) as
      | Record<string, unknown>
      | undefined;

    if (!shareLinkRow) {
      return;
    }

    const record = rowToRecord<ShareLinkRecord>(shareLinkRow, ["albumId"]);
    return ShareLink.rehydrate(record);
  };

  const save = async (
    shareLink: ShareLink,
    albumId: EntityId,
  ): Promise<void> => {
    const record = shareLink.toPersistence();
    const row = { ...record, albumId };

    await database.transaction(async (trx: Knex.Transaction) => {
      const existing = (await trx("shareLink")
        .where({ id: record.id })
        .first()) as Record<string, unknown> | undefined;

      if (existing) {
        await trx("shareLink").where({ id: record.id }).update(row);
      } else {
        await trx("shareLink").insert(row);
      }
    });
  };

  return {
    getById,
    save,
  };
};
