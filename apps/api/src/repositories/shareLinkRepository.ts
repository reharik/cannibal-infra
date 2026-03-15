import type { Knex } from "knex";
import type { EntityId } from "../types/types";
import { ShareLink } from "../domain/ShareLink/ShareLink";
import type { ShareLinkRecord } from "../domain/ShareLink/ShareLink";
import type { ShareLinkRepository } from "../domain/ShareLink/ShareLinkRepository";
import { rowToRecord } from "./rowToRecord";

export const createShareLinkRepository = (
  connection: Knex,
): ShareLinkRepository => {
  const getById = async (id: EntityId): Promise<ShareLink | null> => {
    const shareLinkRow = (await connection("shareLink")
      .where({ id })
      .first()) as Record<string, unknown> | undefined;

    if (!shareLinkRow) {
      return null;
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

    await connection.transaction(async (trx) => {
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
