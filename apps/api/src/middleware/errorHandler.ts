import { RESOLVER } from "awilix";
import { Context, HttpError, Next } from "koa";
import { Container } from "../container";

export type ErrorHandler = (ctx: Context, next: Next) => Promise<void>;

export const buildErrorHandler =
  ({ logger }: Container) =>
  async (ctx: Context, next: Next) => {
    try {
      await next();
    } catch (err) {
      if (err instanceof HttpError) {
        ctx.status = err.status || 500;
        ctx.body = {
          error: err.expose ? err.message : "Internal Server Error",
        };
      } else if (err instanceof Error) {
        ctx.status = 500;
        ctx.body = {
          error: err.message ? err.message : "Internal Server Error",
        };
      }
      // Log the error with context
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error(`Request error: ${ctx.method} ${ctx.path}`, error, {
        status: ctx.status,
        method: ctx.method,
        path: ctx.path,
        requestId: ctx.get("x-request-id") || undefined,
        isHttpError: err instanceof HttpError,
        expose: err instanceof HttpError ? err.expose : false,
      });
      ctx.app.emit("error", err, ctx);
    }
  };

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(buildErrorHandler as any)[RESOLVER] = {};
