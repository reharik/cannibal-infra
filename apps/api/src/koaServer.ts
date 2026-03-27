import cors from "@koa/cors";
import Router from "@koa/router";
import http from "http";
import Koa, { Context } from "koa";
import { koaBody } from "koa-body";
import { IocGeneratedCradle } from "./di/generated/ioc-registry.types";

export type KoaServer = http.Server;

export const buildKoaServer = ({
  routes,
  optionalAuthMiddleware,
  logger,
  graphQLServer,
  errorHandler,
  requestLogger,
  database,
  config,
}: IocGeneratedCradle): KoaServer => {
  const app = new Koa();
  app.context.db = database;
  // 1. Error handling (should be first)
  app.use(errorHandler);

  // 2. Request logging (early in pipeline)
  app.use(requestLogger);

  // 3. CORS (before body parsing)
  app.use(
    cors({
      origin: (ctx): string => {
        const requestOrigin = ctx.get("Origin");

        if (!requestOrigin) {
          return "";
        }

        return config.corsOrigins.includes(requestOrigin) ? requestOrigin : "";
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
  app.use(graphQLServer);

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

  return http.createServer(app.callback());
};
