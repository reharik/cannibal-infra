import { enumeration, type Enumeration } from "smart-enums";

const ResourceTypeEnum = enumeration("ResourceType", {
  input: {
    album: { value: "ALBUM" },
    mediaItem: { value: "MEDIA_ITEM" },
  },
});

export { ResourceTypeEnum };
export type ResourceTypeEnum = Enumeration<typeof ResourceTypeEnum>;
