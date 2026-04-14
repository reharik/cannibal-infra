import { Knex } from 'knex';

export type DbExecutor = Knex | Knex.Transaction;

export interface RepoOptions {
  trx?: Knex.Transaction;
}

export const runInTransaction = async <R>(
  database: Knex,
  options: RepoOptions = {},
  fn: (db: DbExecutor) => Promise<R>,
): Promise<R> => {
  if (options?.trx) {
    return fn(options.trx);
  }

  return database.transaction(async (trx) => fn(trx));
};
