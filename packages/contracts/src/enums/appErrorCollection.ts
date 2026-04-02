import { AlbumErrorEnum, MediaItemErrorEnum } from './errorEnums';

export const AppErrorCollection = {
  album: AlbumErrorEnum,
  mediaItem: MediaItemErrorEnum,
} as const;
