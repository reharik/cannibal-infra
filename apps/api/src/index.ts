import { Logger } from '@packages/infrastructure';
import dotenv from 'dotenv';
import type { Knex } from 'knex';
import { initializeContainer } from './container';
import type { Server } from './server';

const attachGlobalHandlers = (database: Knex, logger: Logger) => {
  let shuttingDown = false;

  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;

    try {
      await database.destroy();
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => {
    void shutdown();
  });

  process.on('SIGTERM', () => {
    void shutdown();
  });

  process.on('unhandledRejection', (reason) => {
    if (reason instanceof Error) {
      logger.error('Unhandled promise rejection', reason);
      return;
    }

    logger.error('Unhandled promise rejection', { reason });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', error);

    // optional but recommended in prod:
    // process.exit(1);
  });
};

const bootstrap = async () => {
  dotenv.config();

  const container = initializeContainer();

  const database = container.resolve<Knex>('database');
  const logger = container.resolve<Logger>('logger');
  attachGlobalHandlers(database, logger);

  const server = container.resolve<Server>('server');
  await server.start();
};

void bootstrap();
