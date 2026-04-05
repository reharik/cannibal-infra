import { enumeration, type Enumeration } from '@reharik/smart-enum';
const input = {
  CoverMediaNotPartOfAlbum: {
    code: 'ALBUM_COVER_MEDIA_NOT_PART_OF_ALBUM',
    message: 'Cover media not part of album',
    root: 'album',
  },
  MediaAlreadyInAlbum: {
    code: 'ALBUM_MEDIA_ALREADY_IN_ALBUM',
    message: 'Media already in album',
    root: 'album',
  },
  UserAlreadyMember: {
    code: 'ALBUM_USER_ALREADY_MEMBER',
    message: 'User already member',
    root: 'album',
  },
  AlbumNotFound: {
    code: 'ALBUM_NOT_FOUND',
    message: 'Album not found',
    root: 'album',
  },
  UserIsNotMember: {
    code: 'USER_IS_NOT_MEMBER',
    message: 'User is not member',
    root: 'album',
  },
  MemberNotAllowedToAddItem: {
    code: 'MEMBER_NOT_ALLOWED_TO_ADD_ITEM',
    message: 'Member not allowed to add item',
    root: 'album',
  },
  UserCanNotCreateAlbum: {
    code: 'USER_CAN_NOT_CREATE_ALBUM',
    message: 'User can not create album',
    root: 'album',
  },
};

export type AlbumErrorEnum = Enumeration<typeof AlbumErrorEnum>;
export const AlbumErrorEnum = enumeration<typeof input>('AlbumErrorEnum', {
  input,
});

const mediaItemInput = {
  StatusNotPending: {
    code: 'MEDIA_ITEM_STATUS_NOT_PENDING',
    message: 'Media item status is not pending',
    root: 'mediaItem',
  },
  MediaItemNotFound: {
    code: 'MEDIA_ITEM_NOT_FOUND',
    message: 'Media item not found',
    root: 'mediaItem',
  },
  MediaBytesNotFound: {
    code: 'MEDIA_BYTES_NOT_FOUND',
    message: 'Media bytes not found',
    root: 'mediaItem',
  },
  MediaItemNotOwnedByViewer: {
    code: 'MEDIA_ITEM_NOT_OWNED_BY_VIEWER',
    message: 'Media item not owned by viewer',
    root: 'mediaItem',
  },
  MediaItemNotReady: {
    code: 'MEDIA_ITEM_NOT_READY',
    message: 'Media item not ready',
    root: 'mediaItem',
  },
};

export type MediaItemErrorEnum = Enumeration<typeof MediaItemErrorEnum>;
export const MediaItemErrorEnum = enumeration<typeof mediaItemInput>('MediaItemErrorEnum', {
  input: mediaItemInput,
});
