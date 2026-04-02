import { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';
import type { UserRecord } from '../../domain/User/User';
import { User } from '../../domain/User/User';
import type { UserRepository as DomainUserRepository } from '../../domain/User/UserRepository';
import type { EntityId } from '../../types/types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UserRepository extends DomainUserRepository {}

export const buildUserRepository = ({ database }: IocGeneratedCradle): UserRepository => {
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
