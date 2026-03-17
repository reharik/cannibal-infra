import cors from "@koa/cors";
import Router from "@koa/router";
import { RESOLVER } from "awilix";
import dotenv from "dotenv";
import http from "http";
import Koa, { Context } from "koa";
import { koaBody } from "koa-body";
import { config } from "./config";
import type { Container } from "./container";
import { createGraphQLServer } from "./graphql/server/createGraphQLServer";
import { database } from "./knex";
import { createErrorHandler } from "./middleware/errorHandler";
import { createRequestLogger } from "./middleware/requestLogger";

dotenv.config();

export type KoaServer = http.Server;

export const createKoaServer = ({
  routes,
  optionalAuthMiddleware,
  logger,
}: Container) => {
  const app = new Koa();
  app.context.db = database;
  // 1. Error handling (should be first)
  app.use(createErrorHandler(logger));

  // 2. Request logging (early in pipeline)
  app.use(createRequestLogger(logger));

  // 3. CORS (before body parsing)
  app.use(
    cors({
      origin: (ctx) => {
        const requestOrigin = ctx.get("Origin");
        if (!requestOrigin) return config.corsOrigins[0] ?? "*";
        if (config.corsOrigins.includes(requestOrigin)) return requestOrigin;
        if (config.corsOrigins.includes("*")) return "*";
        return false;
      },
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }),
  );

  // 4. Body parsing (must be before request processing)
  app.use(koaBody());

  // 5. Auth middleware (before routes)
  app.use(optionalAuthMiddleware);

  // 6. Routes (the actual request handling)
  const router = new Router({ prefix: "/api" });
  routes.mountRoutes(router);
  app.use(router.routes()).use(router.allowedMethods());

  // 7. GraphQL endpoint
  app.use(createGraphQLServer);

  // Health check endpoint (no /api prefix, no auth required)
  app.use(async (ctx, next) => {
    if (ctx.path === "/health") {
      ctx.status = 200;
      ctx.body = {
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "photo-app-api",
      };
      return;
    }
    await next();
  });

  app.on("error", (err: unknown, ctx?: Context) => {
    const error = err instanceof Error ? err : new Error(String(err));

    const requestId =
      ctx && "req" in ctx
        ? (ctx.req?.headers["x-request-id"] as string | undefined)
        : undefined;

    logger.error(
      `Unhandled error${ctx ? ` on ${ctx.method ?? "unknown"} ${ctx.path ?? ""}` : ""}`,
      error,
      {
        status: ctx?.status,
        requestId,
        method: ctx?.method,
        path: ctx?.path,
      },
    );
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

  return http.createServer(app.callback());
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(createKoaServer as any)[RESOLVER] = {};
