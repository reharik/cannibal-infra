import { RESOLVER } from "awilix";
import type { EntityId } from "../../types/types";
import { ShareLink } from "../../domain/ShareLink/ShareLink";
import type { ShareLinkRecord } from "../../domain/ShareLink/ShareLink";
import { rowToRecord } from "./rowToRecord";
import { Container } from "../../container";
import type { ShareLinkRepository as DomainShareLinkRepository } from "../../domain/ShareLink/ShareLinkRepository";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ShareLinkRepository extends DomainShareLinkRepository {}

export const buildShareLinkRepository = ({
  connection,
}: Container): ShareLinkRepository => {
  const getById = async (id: EntityId): Promise<ShareLink | undefined> => {
    const shareLinkRow = (await connection("shareLink")
      .where({ id })
      .first()) as Record<string, unknown> | undefined;

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(buildShareLinkRepository as any)[RESOLVER] = {};
