import type { Knex } from "knex";
import dotenv from "dotenv";
import { initializeContainer } from "./container";
import type { Server } from "./server";
import { Logger } from "./logger";

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

  process.on("SIGINT", () => {
    void shutdown();
  });

  process.on("SIGTERM", () => {
    void shutdown();
  });

  process.on("unhandledRejection", (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));

    logger.error("Unhandled promise rejection", error, {
      reason:
        reason instanceof Error
          ? {
              name: reason.name,
              message: reason.message,
              stack: reason.stack,
            }
          : reason,
    });
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception", error, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // optional but recommended in prod:
    // process.exit(1);
  });
};

const bootstrap = async () => {
  dotenv.config();

  const container = initializeContainer();

  const database = container.resolve<Knex>("database");
  const logger = container.resolve<Logger>("logger");
  attachGlobalHandlers(database, logger);

  const server = container.resolve<Server>("server");
  await server.start();
};

void bootstrap();
