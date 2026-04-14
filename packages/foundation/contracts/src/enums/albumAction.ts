import { Enumeration, enumeration } from '@reharik/smart-enum';
import { ContractError } from './ContractError';

export type AlbumAction = Enumeration<typeof AlbumAction>;
export const AlbumAction = enumeration('AlbumAction', {
  input: {
    view: {
      deniedError: ContractError.AlbumViewForbidden,
    },
    editDetails: {
      deniedError: ContractError.MemberNotAllowedToEditAlbum,
    },
    addItem: {
      deniedError: ContractError.MemberNotAllowedToAddItem,
    },
    removeItem: {
      deniedError: ContractError.MemberNotAllowedToDeleteItem,
    },
    setCover: {
      deniedError: ContractError.AlbumSetCoverForbidden,
    },
    delete: {
      deniedError: ContractError.MemberNotAllowedToDeleteAlbum,
    },
  },
});
