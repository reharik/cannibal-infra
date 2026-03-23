import { RESOLVER } from "awilix";
import { Context, Next } from "koa";
import { Container } from "../container";

export type RequestLogger = (ctx: Context, next: Next) => Promise<void>;

export const buildRequestLogger =
  ({ logger }: Container): RequestLogger =>
  async (ctx: Context, next: Next) => {
    const startTime = Date.now();

    logger.http("Incoming request", {
      method: ctx.method,
      path: ctx.path,
      ip: ctx.ip,
      userAgent: ctx.get("user-agent"),
    });

    await next();

    const duration = Date.now() - startTime;

    logger.http("Request completed", {
      method: ctx.method,
      path: ctx.path,
      status: ctx.status,
      duration: `${duration}ms`,
    });
  };

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(buildRequestLogger as any)[RESOLVER] = {};
