import { enumeration, type Enumeration } from "smart-enums";
const input = ["album", "mediaItem"];

export type ResourceTypeEnum = Enumeration<typeof ResourceTypeEnum>;
export const ResourceTypeEnum = enumeration<typeof input>("ResourceType", {
  input,
});
