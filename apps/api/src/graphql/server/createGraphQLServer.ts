import {
  createYoga,
  type YogaServerInstance,
  // type YogaInitialContext,
} from "graphql-yoga";
import { RESOLVER } from "awilix";
import { schema } from "../schema";
import Koa from "koa";
import type { Container } from "../../container";

export type YogaApp = YogaServerInstance<Koa.ParameterizedContext, object>;
export type GraphQLServer = Koa.Middleware;
interface GraphQLServerDeps {
  yogaApp: YogaApp;
}

export const buildYogaApp = ({ graphQLContext }: Container): YogaApp => {
  return createYoga<Koa.ParameterizedContext>({
    schema,
    context: graphQLContext,
  });
};

export const buildGraphQLServer = ({
  yogaApp,
}: GraphQLServerDeps): GraphQLServer => {
  return async (ctx: Koa.ParameterizedContext) => {
    const response = await yogaApp.handleNodeRequestAndResponse(
      ctx.request,
      ctx.res,
      ctx,
    );

    // Set status code
    ctx.status = response.status;

    // Set headers
    for (const [key, value] of response.headers.entries()) {
      ctx.set(key, value);
    }

    ctx.body = response.body;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(buildGraphQLServer as any)[RESOLVER] = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(buildYogaApp as any)[RESOLVER] = {
  injector: () => ({
    container: "container",
  }),
};
