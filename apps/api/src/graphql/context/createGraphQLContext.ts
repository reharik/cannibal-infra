import { User } from "@packages/contracts";
import type { YogaInitialContext } from "graphql-yoga";
import type Koa from "koa";
import { RESOLVER } from "awilix";
import type { Container } from "../../container";
import type { WriteServices } from "../../application/writeServices";
import type { ViewerReadServices } from "../../application/readServices/readService";

export interface GraphQLContext {
  viewer?: {
    id: string;
    firstName?: string;
    lastName?: string;
    displayName: string;
    isAuthenticated: boolean;
  };
  writeServices?: WriteServices;
  readServices?: ViewerReadServices;
}

export const buildGraphQLContext = ({
  writeServices,
  bindViewerReadServices,
}: Container) => {
  return async (
    initialContext: YogaInitialContext &
      Koa.Context & { state: { isLoggedIn: boolean; user: User } },
  ): Promise<GraphQLContext> => {
    if (!initialContext.state.isLoggedIn || !initialContext.state.user) {
      return {};
    }

    const viewer = {
      id: initialContext.state.user.id,
      firstName: initialContext.state.user.firstName,
      lastName: initialContext.state.user.lastName,
      displayName: `${initialContext.state.user.firstName} ${initialContext.state.user.lastName}`,
      isAuthenticated: true,
    };

    return {
      viewer,
      writeServices,
      readServices: bindViewerReadServices({ viewerId: viewer.id }),
    };
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(buildGraphQLContext as any)[RESOLVER] = {};
