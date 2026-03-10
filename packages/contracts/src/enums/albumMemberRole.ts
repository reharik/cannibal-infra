import { enumeration, type Enumeration } from "smart-enums";

const AlbumMemberRoleEnum = enumeration("AlbumMemberRole", {
  input: {
    viewer: { value: "VIEWER" },
    contributor: { value: "CONTRIBUTOR" },
    admin: { value: "ADMIN" },
  },
});

export { AlbumMemberRoleEnum };
export type AlbumMemberRoleEnum = Enumeration<typeof AlbumMemberRoleEnum>;
