import { AwilixContainer, createContainer } from 'awilix';
import { registerIocFromManifest } from 'ioc-manifest';
import type { Knex } from 'knex';
import { iocManifest } from './di/generated/ioc-manifest';
import type { IocGeneratedCradle } from './di/generated/ioc-registry.types';

let container: AwilixContainer<IocGeneratedCradle> | undefined;

const initializeWorkerContainer = (): AwilixContainer<IocGeneratedCradle> => {
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

const getWorkerContainer = (): AwilixContainer<IocGeneratedCradle> => {
  if (!container) {
    throw new Error(
      '[ioc] container has not been initialized yet. Call initializeWorkerContainer() first.',
    );
  }

  return container;
};

const destroyWorkerContainer = async (): Promise<void> => {
  if (!container) {
    return;
  }
  const db = container.resolve<Knex>('database');
  await db.destroy();
  container = undefined;
};

export { destroyWorkerContainer, getWorkerContainer, initializeWorkerContainer };
