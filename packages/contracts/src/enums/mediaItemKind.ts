import { enumeration, type Enumeration } from "smart-enums";
const input = ["photo", "video"];

export type MediaItemKindEnum = Enumeration<typeof MediaItemKindEnum>;
export const MediaItemKindEnum = enumeration<typeof input>("MediaItemKind", {
  input,
});
