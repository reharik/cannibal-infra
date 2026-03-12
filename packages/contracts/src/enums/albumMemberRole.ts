import { enumeration, type Enumeration } from "smart-enums";
const input = {
  viewer: { value: "VIEWER" },
  contributor: { value: "CONTRIBUTOR" },
  admin: { value: "ADMIN" },
};

export type AlbumMemberRoleEnum = Enumeration<typeof AlbumMemberRoleEnum>;
export const AlbumMemberRoleEnum = enumeration<typeof input>(
  "AlbumMemberRole",
  {
    input,
  },
);
