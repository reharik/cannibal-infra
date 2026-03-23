import type { EntityId } from "../../types/types";
import type { User } from "./User";

export type UserRepository = {
  getById: (id: EntityId) => Promise<User | undefined>;
  save: (user: User) => Promise<void>;
};
