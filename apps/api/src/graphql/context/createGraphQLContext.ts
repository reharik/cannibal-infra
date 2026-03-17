import { User } from "@packages/contracts";
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
  initialContext: YogaInitialContext &
    Koa.Context & { state: { isLoggedIn: boolean; user: User } },
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<GraphQLContext> => {
  if (!initialContext.state.isLoggedIn || !initialContext.state.user) {
    return {
      viewer: null,
    };
  }

  return {
    viewer: {
      id: initialContext.state.user?.id,
      displayName: `${initialContext.state.user?.firstName} ${initialContext.state.user?.lastName}`,
      isAuthenticated: true,
    },
  };
};
