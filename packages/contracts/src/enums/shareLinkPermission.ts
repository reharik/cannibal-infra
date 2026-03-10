import { enumeration, type Enumeration } from "smart-enums";

const ShareLinkPermissionEnum = enumeration("ShareLinkPermission", {
  input: {
    view: { value: "VIEW" },
    comment: { value: "COMMENT" },
    contribute: { value: "CONTRIBUTE" },
  },
});

export { ShareLinkPermissionEnum };
export type ShareLinkPermissionEnum =
  Enumeration<typeof ShareLinkPermissionEnum>;
