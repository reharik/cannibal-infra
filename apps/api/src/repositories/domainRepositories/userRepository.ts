import { IocGeneratedCradle } from "../../di/generated/ioc-registry.types";
import type { EntityId } from "../../types/types";
import { User } from "../../domain/User/User";
import type { UserRecord } from "../../domain/User/User";
import { rowToRecord } from "./rowToRecord";
import type { UserRepository as DomainUserRepository } from "../../domain/User/UserRepository";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UserRepository extends DomainUserRepository {}

export const buildUserRepository = ({
  database,
}: IocGeneratedCradle): UserRepository => {
  const getById = async (id: EntityId): Promise<User | undefined> => {
    const userRow = (await database("user").where({ id }).first()) as
      | Record<string, unknown>
      | undefined;

    if (!userRow) {
      return;
    }

    const record = rowToRecord<UserRecord>(userRow);
    return User.rehydrate(record);
  };

  const save = async (user: User): Promise<void> => {
    const record = user.toPersistence();

    const existing = (await database("user")
      .where({ id: record.id })
      .first()) as Record<string, unknown> | undefined;

    if (existing) {
      await database("user").where({ id: record.id }).update(record);
    } else {
      await database("user").insert(record);
    }
  };

  return {
    getById,
    save,
  };
};
