import { enumeration, type Enumeration } from "smart-enums";

const UserRoleEnum = enumeration("UserRole", {
  input: {
    adult: { value: "ADULT" },
    kid: { value: "KID" },
  },
});

export { UserRoleEnum };
export type UserRoleEnum = Enumeration<typeof UserRoleEnum>;
