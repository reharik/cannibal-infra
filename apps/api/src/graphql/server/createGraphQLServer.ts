import { createYoga } from "graphql-yoga";
import { schema } from "../schema";
import Koa from "koa";
import type { IocGeneratedCradle } from "../../di/generated/ioc-registry.types";

/**
 * App-local contract for graphql-yoga so ioc-manifest can resolve a named contract symbol.
 */
export interface YogaApp {
  handleNodeRequestAndResponse(
    request: unknown,
    response: unknown,
    context: Koa.ParameterizedContext,
  ): Promise<Response>;
  fetch(
    input: string | URL,
    init?: RequestInit,
    context?: unknown,
  ): Promise<Response>;
}

export interface GraphQLServer {
  (ctx: Koa.ParameterizedContext, next: Koa.Next): Promise<void>;
}

interface GraphQLServerDeps {
  yogaApp: YogaApp;
}

export const buildYogaApp = ({
  graphQLContext,
}: IocGeneratedCradle): YogaApp => {
  return createYoga<Koa.ParameterizedContext>({
    schema,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- cradle resolves graphQLContext after IoC registration
    context: graphQLContext,
  }) as YogaApp;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- yoga app adapter
export const buildGraphQLServer = ({
  yogaApp,
}: GraphQLServerDeps): GraphQLServer => {
  return async (ctx: Koa.ParameterizedContext, next: Koa.Next) => {
    void next;
    const response = await yogaApp.handleNodeRequestAndResponse(
      ctx.request,
      ctx.res,
      ctx,
    );

    ctx.status = response.status;

    for (const [key, value] of response.headers.entries()) {
      ctx.set(key, value);
    }

    ctx.body = response.body;
  };
};
