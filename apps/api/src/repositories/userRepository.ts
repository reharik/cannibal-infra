import type { Knex } from "knex";
import type { EntityId } from "../types/types";
import { User } from "../domain/User/User";
import type { UserRecord } from "../domain/User/User";
import type { UserRepository } from "../domain/User/UserRepository";
import { rowToRecord } from "./rowToRecord";

export const createUserRepository = (connection: Knex): UserRepository => {
  const getById = async (id: EntityId): Promise<User | null> => {
    const userRow = (await connection("user").where({ id }).first()) as
      | Record<string, unknown>
      | undefined;

    if (!userRow) {
      return null;
    }

    const record = rowToRecord<UserRecord>(userRow);
    return User.rehydrate(record);
  };

  const save = async (user: User): Promise<void> => {
    const record = user.toPersistence();

    const existing = (await connection("user")
      .where({ id: record.id })
      .first()) as Record<string, unknown> | undefined;

    if (existing) {
      await connection("user").where({ id: record.id }).update(record);
    } else {
      await connection("user").insert(record);
    }
  };

  return {
    getById,
    save,
  };
};
