import { AlbumAction, AlbumMemberRoleEnum } from '@packages/contracts';
import { fail, ok } from '../../domain/utilities/writeResponse';

export const albumRolePermissions: Record<AlbumMemberRoleEnum['key'], readonly AlbumAction[]> = {
  owner: [
    AlbumAction.view,
    AlbumAction.editDetails,
    AlbumAction.addItem,
    AlbumAction.removeItem,
    AlbumAction.setCover,
    AlbumAction.delete,
  ],
  admin: [
    AlbumAction.view,
    AlbumAction.editDetails,
    AlbumAction.addItem,
    AlbumAction.removeItem,
    AlbumAction.setCover,
    AlbumAction.delete,
  ],
  contributor: [AlbumAction.view, AlbumAction.addItem, AlbumAction.removeItem],
  viewer: [AlbumAction.view],
};

export const canAlbumMemberPerform = (role: AlbumMemberRoleEnum, action: AlbumAction): boolean => {
  return albumRolePermissions[role.key].some((allowed) => allowed.value === action.value);
};

export const ensureAlbumPermission = (role: AlbumMemberRoleEnum, action: AlbumAction) => {
  if (!role || !canAlbumMemberPerform(role, action)) {
    return fail(action.deniedError);
  }

  return ok(undefined);
};
