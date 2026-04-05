import type { Knex } from 'knex';

/**
 * Tears down the Knex pool registered by `initializeContainer` in test runs.
 * Does not import the IoC container so Jest can load this file without ESM/CJS issues.
 */
const globalTeardown = async (): Promise<void> => {
  const g = globalThis as typeof globalThis & { __photoappTestKnex?: Knex };
  if (g.__photoappTestKnex) {
    await g.__photoappTestKnex.destroy();
    g.__photoappTestKnex = undefined;
  }
};

export default globalTeardown;
