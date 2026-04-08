import { ok } from 'apps/api/src/domain/utilities/writeResponse';
import { IocGeneratedCradle } from '../../../di/generated/ioc-registry.types';
import { Album } from '../../../domain/Album/Album';
import { WriteResult } from '../../../types/types';
import { WriteServiceBase } from '../writeServiceBaseType';
import { CreateAlbumCommand, CreateAlbumResult } from './writeAlbum.types';

export interface CreateAlbum extends WriteServiceBase {
  (input: CreateAlbumCommand): Promise<WriteResult<CreateAlbumResult>>;
}

export const buildCreateAlbum = ({ albumRepository }: IocGeneratedCradle): CreateAlbum => {
  return async (input: CreateAlbumCommand): Promise<WriteResult<CreateAlbumResult>> => {
    const { viewerId, title } = input;
    const album = Album.create(
      {
        title,
      },
      viewerId,
    );

    await albumRepository.save(album);

    return ok({
      albumId: album.id(),
    });
  };
};
