import { enumeration, type Enumeration } from '@reharik/smart-enum';
const input = ['view', 'comment', 'contribute'];

export type ShareLinkPermissionEnum = Enumeration<typeof ShareLinkPermissionEnum>;
export const ShareLinkPermissionEnum = enumeration<typeof input>('ShareLinkPermission', {
  input,
});
