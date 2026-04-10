import { enumeration, type Enumeration } from '@reharik/smart-enum';
import { ErrorCategory } from './graphqlSmartEnums';

const errorAreaInput = ['album', 'mediaItem', 'membership', 'viewer', 'auth'] as const;

export type ErrorArea = Enumeration<typeof ErrorArea>;
export const ErrorArea = enumeration<typeof errorAreaInput>('ErrorArea', {
  input: errorAreaInput,
});

const contractErrorInput = {
  CoverMediaNotPartOfAlbum: {
    code: 'ALBUM_COVER_MEDIA_NOT_PART_OF_ALBUM',
    display: 'Cover media not part of album',
    category: ErrorCategory.domain,
    area: ErrorArea.album,
    retryable: false,
  },
  MediaAlreadyInAlbum: {
    code: 'ALBUM_MEDIA_ALREADY_IN_ALBUM',
    display: 'Media already in album',
    category: ErrorCategory.domain,
    area: ErrorArea.album,
    retryable: false,
  },
  UserAlreadyMember: {
    code: 'ALBUM_USER_ALREADY_MEMBER',
    display: 'User already member',
    category: ErrorCategory.domain,
    area: ErrorArea.album,
    retryable: false,
  },
  AlbumNotFound: {
    code: 'ALBUM_NOT_FOUND',
    display: 'Album not found',
    category: ErrorCategory.domain,
    area: ErrorArea.album,
    retryable: false,
  },
  UserIsNotMember: {
    code: 'USER_IS_NOT_MEMBER',
    display: 'User is not member',
    category: ErrorCategory.auth,
    area: ErrorArea.album,
    retryable: false,
  },
  MemberNotAllowedToAddItem: {
    code: 'MEMBER_NOT_ALLOWED_TO_ADD_ITEM',
    display: 'Member not allowed to add item',
    category: ErrorCategory.auth,
    area: ErrorArea.album,
    retryable: false,
  },
  UserCanNotCreateAlbum: {
    code: 'USER_CAN_NOT_CREATE_ALBUM',
    display: 'User can not create album',
    category: ErrorCategory.auth,
    area: ErrorArea.album,
    retryable: false,
  },

  StatusNotPending: {
    code: 'MEDIA_ITEM_STATUS_NOT_PENDING',
    display: 'Media item status is not pending',
    category: ErrorCategory.domain,
    area: ErrorArea.mediaItem,
    retryable: false,
  },
  StatusNotUploaded: {
    code: 'MEDIA_ITEM_STATUS_NOT_UPLOADED',
    display: 'Media item is not awaiting derivative processing',
    category: ErrorCategory.domain,
    area: ErrorArea.mediaItem,
    retryable: false,
  },
  MediaItemNotFound: {
    code: 'MEDIA_ITEM_NOT_FOUND',
    display: 'Media item not found',
    category: ErrorCategory.domain,
    area: ErrorArea.mediaItem,
    retryable: false,
  },
  MediaBytesNotFound: {
    code: 'MEDIA_BYTES_NOT_FOUND',
    display: 'Media bytes not found',
    category: ErrorCategory.domain,
    area: ErrorArea.mediaItem,
    retryable: false,
  },
  MediaItemNotOwnedByViewer: {
    code: 'MEDIA_ITEM_NOT_OWNED_BY_VIEWER',
    display: 'Media item not owned by viewer',
    category: ErrorCategory.auth,
    area: ErrorArea.mediaItem,
    retryable: false,
  },
  MediaItemNotReady: {
    code: 'MEDIA_ITEM_NOT_READY',
    display: 'Media item not ready',
    category: ErrorCategory.domain,
    area: ErrorArea.mediaItem,
    retryable: false,
  },
  MediaDimensionsNotAvailable: {
    code: 'MEDIA_DIMENSIONS_NOT_AVAILABLE',
    display: 'Could not read media width and height from the uploaded file',
    category: ErrorCategory.domain,
    area: ErrorArea.mediaItem,
    retryable: true,
  },
  InvalidMediaDimensions: {
    code: 'MEDIA_ITEM_INVALID_DIMENSIONS',
    display: 'Media dimensions must be positive integers',
    category: ErrorCategory.domain,
    area: ErrorArea.mediaItem,
    retryable: false,
  },
} as const;

export type ContractError = Enumeration<typeof ContractError>;
export const ContractError = enumeration<typeof contractErrorInput>('ContractError', {
  input: contractErrorInput,
});
