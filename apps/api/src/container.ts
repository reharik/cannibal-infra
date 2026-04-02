import { AwilixContainer, createContainer } from 'awilix';
import { registerIocFromManifest } from 'ioc-manifest';
import { iocManifest } from './di/generated/ioc-manifest';
import type { IocGeneratedCradle } from './di/generated/ioc-registry.types';

let container: AwilixContainer<IocGeneratedCradle> | undefined;

const initializeContainer = (): AwilixContainer<IocGeneratedCradle> => {
  if (container) {
    return container;
  }

  const _container = createContainer<IocGeneratedCradle>({
    injectionMode: 'PROXY',
  });

  registerIocFromManifest(_container, iocManifest);

  container = _container;
  return container;
};

const getContainer = (): AwilixContainer<IocGeneratedCradle> => {
  if (!container) {
    throw new Error(
      '[ioc] container has not been initialized yet. Call initializeContainer() first.',
    );
  }

  return container;
};

export { getContainer, initializeContainer };
