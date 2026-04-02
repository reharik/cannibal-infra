import { AlbumMemberRoleEnum } from '@packages/contracts';
import { withEnumRevival } from '@reharik/smart-enum-knex';
import type { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';

export type AlbumReadRepository = {
  listByViewerId: ({ viewerId }: { viewerId: string }) => Promise<AlbumRow[]>;
  getAlbumForViewer: ({
    albumId,
    viewerId,
  }: {
    albumId: string;
    viewerId: string;
  }) => Promise<AlbumRow | undefined>;
};

// THIS IS ALL BROKE probably needs the child rows on there to from the joins
type AlbumRow = {
  id: string;
  title: string;
  coverMediaId: string | undefined;
};

export const buildAlbumReadRepository = ({
  database,
}: IocGeneratedCradle): AlbumReadRepository => ({
  listByViewerId: async ({ viewerId }: { viewerId: string }): Promise<AlbumRow[]> => {
    return withEnumRevival(
      database<AlbumRow>('album')
        .innerJoin('albumMember', 'albumMember.albumId', 'album.id')
        .where('albumMember.userId', viewerId)
        .select<AlbumRow[]>('album.id', 'album.title', 'album.coverMediaId'),
      { albumMemberRole: AlbumMemberRoleEnum },
      { strict: true },
    );
  },

  getAlbumForViewer: async ({
    albumId,
    viewerId,
  }: {
    albumId: string;
    viewerId: string;
  }): Promise<AlbumRow | undefined> => {
    const row = await database('album')
      .innerJoin('albumMember', 'albumMember.albumId', 'album.id')
      .where('albumMember.userId', viewerId)
      .andWhere('album.id', albumId)
      .first<AlbumRow>('album.id', 'album.title', 'album.coverMediaId');

    return row;
  },
});
