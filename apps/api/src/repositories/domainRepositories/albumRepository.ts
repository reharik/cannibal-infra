import type { Knex } from "knex";
import type { EntityId } from "../../types/types";
import { Album, type AlbumRecord } from "../../domain/Album/Album";
import type { AlbumItemRecord } from "../../domain/Album/AlbumItem";
import type { AlbumMemberRecord } from "../../domain/Album/AlbumMember";
import { rowToRecord } from "./rowToRecord";
import { IocGeneratedCradle } from "../../di/generated/ioc-registry.types";
import type { AlbumRepository as DomainAlbumRepository } from "../../domain/Album/AlbumRepository";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AlbumRepository extends DomainAlbumRepository {}

export const buildAlbumRepository = ({
  database,
}: IocGeneratedCradle): AlbumRepository => {
  const getById = async (id: EntityId): Promise<Album | undefined> => {
    const albumRow = (await database("album").where({ id }).first()) as
      | Record<string, unknown>
      | undefined;

    if (!albumRow) {
      return;
    }

    const itemRows = (await database("albumItem")
      .where({ albumId: id })
      .orderBy("createdAt", "asc")) as Record<string, unknown>[];

    const memberRows = (await database("albumMember")
      .where({ albumId: id })
      .orderBy("createdAt", "asc")) as Record<string, unknown>[];

    type AlbumRecordBase = Omit<
      AlbumRecord,
      "items" | "members" | "shareLinkIds"
    >;

    const record: AlbumRecord = {
      ...rowToRecord<AlbumRecordBase>(albumRow),
      items: itemRows.map((row) =>
        rowToRecord<AlbumItemRecord>(row, ["albumId"]),
      ),
      members: memberRows.map((row) =>
        rowToRecord<AlbumMemberRecord>(row, ["albumId"]),
      ),
    };

    return Album.rehydrate(record);
  };

  const save = async (album: Album): Promise<void> => {
    const record = album.toPersistence();
    const { items, members, ...albumRow } = record;

    await database.transaction(async (trx: Knex.Transaction) => {
      const existing = (await trx("album").where({ id: record.id }).first()) as
        | Record<string, unknown>
        | undefined;

      if (existing) {
        await trx("album").where({ id: record.id }).update(albumRow);
      } else {
        await trx("album").insert(albumRow);
      }

      await trx("albumItem").where({ albumId: record.id }).delete();
      if (items.length > 0) {
        await trx("albumItem").insert(
          items.map((item) => ({
            ...item,
            albumId: record.id,
          })),
        );
      }

      await trx("albumMember").where({ albumId: record.id }).delete();
      if (members.length > 0) {
        await trx("albumMember").insert(
          members.map((member) => ({
            ...member,
            albumId: record.id,
          })),
        );
      }
    });
  };

  return {
    getById,
    save,
  };
};
