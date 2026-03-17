import type { YogaInitialContext } from "graphql-yoga";
import type Koa from "koa";

export interface GraphQLContext {
  viewer: {
    id: string;
    displayName: string;
    isAuthenticated: boolean;
  } | null;
}

export const createGraphQLContext = async (
  initialContext: YogaInitialContext & { ctx: Koa.Context },
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<GraphQLContext> => {
  const koaCtx = initialContext.ctx;

  if (!koaCtx.isLoggedIn || !koaCtx.user) {
    return {
      viewer: null,
    };
  }

  return {
    viewer: {
      id: koaCtx.user.id,
      displayName: koaCtx.user.name,
      isAuthenticated: true,
    },
  };
};
