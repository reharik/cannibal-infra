import type { AwilixContainer } from 'awilix';
import type { Knex } from 'knex';

import { initializeContainer } from '../container';
import type { IocGeneratedCradle } from '../di/generated/ioc-registry.types';
import { ensureTestViewerUsers } from './ensureTestViewerUsers';
import { createExecuteGraphQL } from './executeGQL';

const registerTestKnexForGlobalTeardown = (
  container: AwilixContainer<IocGeneratedCradle>,
): void => {
  if (process.env.NODE_ENV !== 'test') {
    return;
  }
  const g = globalThis as typeof globalThis & { __photoappTestKnex?: Knex };
  g.__photoappTestKnex = container.resolve('database');
};

/**
 * Shared bootstrap for GraphQL integration tests that hit the real DB (FKs on user ids).
 */
export const setupGraphqlIntegrationTests = async (): Promise<{
  container: AwilixContainer<IocGeneratedCradle>;
  executeGraphQL: ReturnType<typeof createExecuteGraphQL>;
}> => {
  const container = initializeContainer();
  registerTestKnexForGlobalTeardown(container);
  await ensureTestViewerUsers(container.resolve('database'));
  const yogaApp = container.resolve('yogaApp');
  return {
    container,
    executeGraphQL: createExecuteGraphQL({ yogaApp }),
  };
};
