import { enumeration, type Enumeration } from '@reharik/smart-enum';
const input = ['owner', 'viewer', 'contributor', 'admin'] as const;

export type AlbumMemberRoleEnum = Enumeration<typeof AlbumMemberRoleEnum>;
export const AlbumMemberRoleEnum = enumeration<typeof input>('AlbumMemberRole', {
  input,
});
