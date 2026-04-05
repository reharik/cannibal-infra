import { ok } from 'apps/api/src/domain/utilities/writeResponse';
import { IocGeneratedCradle } from '../../../di/generated/ioc-registry.types';
import { Album } from '../../../domain/Album/Album';
import { EntityId, WriteResult } from '../../../types/types';
import { WriteServiceBase } from '../writeServiceBaseType';

export type CreateAlbumDTO = {
  viewerId: string;
  title: string;
  description?: string;
};

export interface CreateAlbum extends WriteServiceBase {
  (input: CreateAlbumDTO): Promise<WriteResult<CreateAlbumResultDTO>>;
}

export type CreateAlbumResultDTO = {
  albumId: EntityId;
};

export const buildCreateAlbum = ({ albumRepository }: IocGeneratedCradle): CreateAlbum => {
  return async (input: CreateAlbumDTO): Promise<WriteResult<CreateAlbumResultDTO>> => {
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
