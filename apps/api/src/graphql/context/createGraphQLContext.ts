import { User } from "@packages/contracts";
import type { YogaInitialContext } from "graphql-yoga";
import type Koa from "koa";
import type {
  IocGeneratedCradle,
  IocGeneratedTypes,
} from "../../di/generated/ioc-registry.types";
import { StripFactory } from "../../types/types";

export type ReadServices = StripFactory<
  IocGeneratedTypes["readServiceFactories"]
>;

export interface GraphQLContext {
  viewer?: {
    id: string;
    firstName?: string;
    lastName?: string;
    displayName: string;
    isAuthenticated: boolean;
  };
  // writeServices?: WriteServices;
  readServices?: ReadServices;
}

type GraphQLInitialContext = YogaInitialContext &
  Koa.Context & { state: { isLoggedIn: boolean; user: User } };

export interface GraphQLContextFactory {
  (initialContext: GraphQLInitialContext): GraphQLContext;
}

export const buildGraphQLContext = ({
  // writeServices,
  readServiceFactories,
}: IocGeneratedCradle): GraphQLContextFactory => {
  return (initialContext: GraphQLInitialContext): GraphQLContext => {
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

    const rs: ReadServices = Object.entries(
      readServiceFactories,
    ).reduce<ReadServices>((acc, [key, service]) => {
      return {
        ...acc,
        [key]: service({ viewerId: viewer.id }),
      };
    }, {} as ReadServices);

    return {
      viewer,
      // writeServices,
      readServices: rs,
    };
  };
};
