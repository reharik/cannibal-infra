import type { AwilixContainer } from 'awilix';

import { initializeContainer } from '../container';
import type { IocGeneratedCradle } from '../di/generated/ioc-registry.types';
import { createExecuteGraphQL } from './executeGQL';
import { ensureTestViewerUsers } from './ensureTestViewerUsers';

/**
 * Shared bootstrap for GraphQL integration tests that hit the real DB (FKs on user ids).
 */
export const setupGraphqlIntegrationTests = async (): Promise<{
  container: AwilixContainer<IocGeneratedCradle>;
  executeGraphQL: ReturnType<typeof createExecuteGraphQL>;
}> => {
  const container = initializeContainer();
  await ensureTestViewerUsers(container.resolve('database'));
  const yogaApp = container.resolve('yogaApp');
  return {
    container,
    executeGraphQL: createExecuteGraphQL({ yogaApp }),
  };
};
