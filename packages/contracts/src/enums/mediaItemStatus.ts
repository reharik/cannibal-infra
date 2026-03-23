import { enumeration, type Enumeration } from "smart-enums";
const input = ["pending", "ready", "failed"];

export type MediaItemStatusEnum = Enumeration<typeof MediaItemStatusEnum>;
export const MediaItemStatusEnum = enumeration<typeof input>(
  "MediaItemStatus",
  {
    input,
  },
);
