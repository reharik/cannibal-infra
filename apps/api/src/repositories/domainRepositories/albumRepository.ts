import { AlbumMemberRoleEnum } from '@packages/contracts';
import { withEnumRevival } from '@reharik/smart-enum-knex';
import type { Knex } from 'knex';
import { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';
import { Album, type AlbumRecord } from '../../domain/Album/Album';
import type { AlbumItemRecord } from '../../domain/Album/AlbumItem';
import type { AlbumMemberRecord } from '../../domain/Album/AlbumMember';
import type { AlbumRepository as DomainAlbumRepository } from '../../domain/Album/AlbumRepository';
import type { EntityId } from '../../types/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AlbumRepository extends DomainAlbumRepository {}

export const buildAlbumRepository = ({ database }: IocGeneratedCradle): AlbumRepository => {
  const getById = async (id: EntityId): Promise<Album | undefined> => {
    const albumRow = await database<AlbumRecord>('album').where({ id }).first();

    if (!albumRow) {
      return;
    }

    const itemRows = await database<AlbumItemRecord>('albumItem')
      .where({ albumId: id })
      .orderBy('createdAt', 'asc');

    const memberRows = await withEnumRevival(
      database<AlbumMemberRecord>('albumMember').where({ albumId: id }).orderBy('createdAt', 'asc'),
      { albumMemberRole: AlbumMemberRoleEnum },
      { strict: true },
    );

    albumRow.items = itemRows;
    albumRow.members = memberRows;

    return Album.rehydrate(albumRow);
  };

  const save = async (album: Album): Promise<void> => {
    const record = album.toPersistence();
    const { items, members, ...albumRow } = record;

    await database.transaction(async (trx: Knex.Transaction) => {
      const existing = await trx<AlbumRecord>('album').where({ id: record.id }).first();

      if (existing) {
        await trx<AlbumRecord>('album').where({ id: record.id }).update(albumRow);
      } else {
        await trx<AlbumRecord>('album').insert(albumRow);
      }

      await trx<AlbumItemRecord>('albumItem').where({ albumId: record.id }).delete();
      if (items.length > 0) {
        await trx<AlbumItemRecord>('albumItem').insert(
          items.map((item) => ({
            ...item,
            albumId: record.id,
          })),
        );
      }

      await trx<AlbumMemberRecord>('albumMember').where({ albumId: record.id }).delete();
      if (members.length > 0) {
        await trx<AlbumMemberRecord>('albumMember').insert(
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
