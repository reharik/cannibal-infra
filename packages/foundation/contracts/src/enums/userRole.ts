import { enumeration, type Enumeration } from '@reharik/smart-enum';
const input = ['adult', 'kid'];

export type UserRoleEnum = Enumeration<typeof UserRoleEnum>;
export const UserRoleEnum = enumeration<typeof input>('UserRole', {
  input,
});
