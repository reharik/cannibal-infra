import { enumeration, type Enumeration } from "smart-enums";

const NotificationKindEnum = enumeration("NotificationKind", {
  input: {
    shareInvite: { value: "SHARE_INVITE" },
    albumShared: { value: "ALBUM_SHARED" },
    mediaAdded: { value: "MEDIA_ADDED" },
    comment: { value: "COMMENT" },
    commentReply: { value: "COMMENT_REPLY" },
  },
});

export { NotificationKindEnum };
export type NotificationKindEnum = Enumeration<typeof NotificationKindEnum>;
