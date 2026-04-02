import { enumeration, type Enumeration } from '@reharik/smart-enum';
const input = ['album', 'mediaItem'];

export type ResourceTypeEnum = Enumeration<typeof ResourceTypeEnum>;
export const ResourceTypeEnum = enumeration<typeof input>('ResourceType', {
  input,
});
