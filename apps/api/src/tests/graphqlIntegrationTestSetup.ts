import type { AwilixContainer } from 'awilix';
import { asValue, createContainer } from 'awilix';
import { registerIocFromManifest } from 'ioc-manifest';
import type { Knex } from 'knex';

import { iocManifest } from '../di/generated/ioc-manifest';
import type { IocGeneratedCradle } from '../di/generated/ioc-registry.types';
import { ensureTestViewerUsers } from './ensureTestViewerUsers';
import { createExecuteGraphQL } from './executeGQL';
import { createIntegrationTestMediaStorage } from './integrationTestMediaStorage';

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
 * Uses in-memory MediaStorage so tests do not require S3 or a local media directory.
 */
export const setupGraphqlIntegrationTests = async (): Promise<{
  container: AwilixContainer<IocGeneratedCradle>;
  executeGraphQL: ReturnType<typeof createExecuteGraphQL>;
  integrationTestMediaStorage: ReturnType<typeof createIntegrationTestMediaStorage>;
}> => {
  const integrationTestMediaStorage = createIntegrationTestMediaStorage();
  const container = createContainer<IocGeneratedCradle>({
    injectionMode: 'PROXY',
  });
  registerIocFromManifest(container, iocManifest);
  container.register({
    mediaStorage: asValue(integrationTestMediaStorage),
  });
  registerTestKnexForGlobalTeardown(container);
  await ensureTestViewerUsers(container.resolve('database'));
  const yogaApp = container.resolve('yogaApp');
  return {
    container,
    executeGraphQL: createExecuteGraphQL({ yogaApp }),
    integrationTestMediaStorage,
  };
};
