import { enumeration, type Enumeration } from "smart-enums";
const input = [
  "shareInvite",
  "albumShared",
  "mediaAdded",
  "comment",
  "commentReply",
] as const;

export type NotificationKindEnum = Enumeration<typeof NotificationKindEnum>;
export const NotificationKindEnum = enumeration<typeof input>(
  "NotificationKind",
  {
    input,
  },
);
