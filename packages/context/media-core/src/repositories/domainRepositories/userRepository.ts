import type { Knex } from 'knex';
import type { UserRecord } from '../../domain/User/User';
import { User } from '../../domain/User/User';
import type { EntityId } from '../../types/types';

export type UserRepository = {
  getById: (id: EntityId) => Promise<User | undefined>;
  save: (user: User) => Promise<void>;
};

type UserRepositoryDeps = { database: Knex };

export const buildUserRepository = ({ database }: UserRepositoryDeps): UserRepository => {
  const getById = async (id: EntityId): Promise<User | undefined> => {
    const userRow = await database<UserRecord>('user').where({ id }).first();

    if (!userRow) {
      return;
    }

    return User.rehydrate(userRow);
  };

  const save = async (user: User): Promise<void> => {
    const record = user.toPersistence();

    const existing = await database<UserRecord>('user').where({ id: record.id }).first();

    if (existing) {
      await database<UserRecord>('user').where({ id: record.id }).update(record);
    } else {
      await database<UserRecord>('user').insert(record);
    }
  };

  return {
    getById,
    save,
  };
};
