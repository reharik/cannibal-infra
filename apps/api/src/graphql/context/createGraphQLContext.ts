import type { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';
import {
  GraphQLContext,
  GraphQLContextFactory,
  GraphQLInitialContext,
  ReadServices,
} from './types';

export const buildCreateGraphQLContext = ({
  writeServices,
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

    const rs = {} as ReadServices;

    for (const key of Object.keys(readServiceFactories) as Array<
      keyof typeof readServiceFactories
    >) {
      const serviceKey = key.replace(/Factory$/, '') as keyof ReadServices;
      (rs as Record<string, unknown>)[serviceKey] = readServiceFactories[key]({
        viewerId: viewer.id,
      });
    }

    return {
      viewer,
      writeServices,
      readServices: rs,
    };
  };
};
