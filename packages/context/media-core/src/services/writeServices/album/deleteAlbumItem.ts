import { AlbumMemberRoleEnum, AppErrorCollection } from '@packages/contracts';
import { loadRequiredAlbum } from '../../../application/support/resourceLoaders';
import { fail, ok } from '../../../domain/utilities/writeResponse';
import { AlbumRepository } from '../../../repositories/domainRepositories/albumRepository';
import { WriteResult } from '../../../types/types';
import { WriteServiceBase } from '../writeServiceBaseType';
import { DeleteAlbumItemCommand, DeleteAlbumItemResult } from './writeAlbum.types';

export interface DeleteAlbumItem extends WriteServiceBase {
  (input: DeleteAlbumItemCommand): Promise<WriteResult<DeleteAlbumItemResult>>;
}

type DeleteAlbumItemDeps = {
  albumRepository: AlbumRepository;
};

export const buildDeleteAlbumItem = ({ albumRepository }: DeleteAlbumItemDeps): DeleteAlbumItem => {
  return async (input: DeleteAlbumItemCommand): Promise<WriteResult<DeleteAlbumItemResult>> => {
    const { viewerId, albumId, mediaItemId } = input;
    const getResult = await loadRequiredAlbum(albumId, albumRepository);
    if (!getResult.success) {
      return getResult;
    }
    const album = getResult.value;
    const member = album.getAlbumMember(viewerId);
    if (!member) {
      return fail(AppErrorCollection.album.UserIsNotMember);
    }
    const membersWhoCanDelete: AlbumMemberRoleEnum[] = [
      AlbumMemberRoleEnum.owner,
      AlbumMemberRoleEnum.admin,
    ];
    if (!membersWhoCanDelete.includes(member.role())) {
      return fail(AppErrorCollection.album.MemberNotAllowedToDeleteItem);
    }

    const deleteResult = album.deleteItem(mediaItemId, viewerId);
    if (!deleteResult.success) {
      return deleteResult;
    }
    await albumRepository.save(album);
    return ok({ albumId: album.id(), mediaItemId: mediaItemId });
  };
};
