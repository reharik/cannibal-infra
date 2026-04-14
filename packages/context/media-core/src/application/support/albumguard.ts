import { AlbumAction, AppErrorCollection } from '@packages/contracts';
import { Album } from '../../domain/Album/Album';
import { fail } from '../../domain/utilities/writeResponse';
import { EntityId } from '../../types/types';
import { ensureAlbumPermission } from '../authorization/albumAuthorization';

export const ensureMemberCanEditAlbum = (album: Album, viewerId: EntityId) => {
  const member = album.getAlbumMember(viewerId);
  if (!member) {
    return fail(AppErrorCollection.album.UserIsNotMember);
  }
  return ensureAlbumPermission(member.role(), AlbumAction.editDetails);
};
