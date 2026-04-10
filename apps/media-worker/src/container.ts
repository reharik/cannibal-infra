import { asFunction, AwilixContainer, createContainer, Lifetime } from 'awilix';
import { registerIocFromManifest } from 'ioc-manifest';
import type { Knex } from 'knex';

import { iocManifest } from '../../api/src/di/generated/ioc-manifest.ts';
import type { IocGeneratedCradle } from '../../api/src/di/generated/ioc-registry.types.ts';
import { buildRunMediaWorkerLoop, type RunMediaWorkerLoop } from './runMediaWorkerLoop';

type WorkerCradle = IocGeneratedCradle & {
  runMediaWorkerLoop: RunMediaWorkerLoop;
};

let container: AwilixContainer<WorkerCradle> | undefined;

export const initializeWorkerContainer = (): AwilixContainer<WorkerCradle> => {
  if (container) {
    return container;
  }

  const next = createContainer<WorkerCradle>({
    injectionMode: 'PROXY',
  });
  registerIocFromManifest(next as unknown as AwilixContainer<IocGeneratedCradle>, iocManifest);
  next.register({
    runMediaWorkerLoop: asFunction(buildRunMediaWorkerLoop, {
      lifetime: Lifetime.SINGLETON,
    }),
  });

  container = next;
  return next;
};

export const destroyWorkerContainer = async (): Promise<void> => {
  if (!container) {
    return;
  }
  const db = container.resolve<Knex>('database');
  await db.destroy();
  container = undefined;
};
