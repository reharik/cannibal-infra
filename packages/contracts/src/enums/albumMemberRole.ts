import { enumeration, type Enumeration } from "smart-enums";
const input = ["viewer", "contributor", "admin"];

export type AlbumMemberRoleEnum = Enumeration<typeof AlbumMemberRoleEnum>;
export const AlbumMemberRoleEnum = enumeration<typeof input>(
  "AlbumMemberRole",
  {
    input,
  },
);
