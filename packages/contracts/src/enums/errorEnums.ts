import { enumeration, type Enumeration } from "smart-enums";
const input = {
  CoverMediaNotPartOfAlbum: {
    code: "ALBUM_COVER_MEDIA_NOT_PART_OF_ALBUM",
    message: "Cover media not part of album",
    root: "album",
  },
  MediaAlreadyInAlbum: {
    code: "ALBUM_MEDIA_ALREADY_IN_ALBUM",
    message: "Media already in album",
    root: "album",
  },
  UserAlreadyMember: {
    code: "ALBUM_USER_ALREADY_MEMBER",
    message: "User already member",
    root: "album",
  },
};

export type AlbumErrorEnum = Enumeration<typeof AlbumErrorEnum>;
export const AlbumErrorEnum = enumeration<typeof input>("AlbumErrorEnum", {
  input,
});

const mediaItemInput = {
  StatusNotPending: {
    code: "MEDIA_ITEM_STATUS_NOT_PENDING",
    message: "Media item status is not pending",
    root: "mediaItem",
  },
};

export type MediaItemErrorEnum = Enumeration<typeof MediaItemErrorEnum>;
export const MediaItemErrorEnum = enumeration<typeof mediaItemInput>(
  "MediaItemErrorEnum",
  {
    input: mediaItemInput,
  },
);
