import { enumeration, type Enumeration } from "smart-enums";

const MediaItemKindEnum = enumeration("MediaItemKind", {
  input: {
    photo: { value: "PHOTO" },
    video: { value: "VIDEO" },
  },
});

export { MediaItemKindEnum };
export type MediaItemKindEnum = Enumeration<typeof MediaItemKindEnum>;
