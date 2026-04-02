import { User } from '@packages/contracts';
import type { YogaInitialContext } from 'graphql-yoga';
import type Koa from 'koa';
import { IocGeneratedTypes } from '../../di/generated/ioc-registry.types';
import { StripFactory } from '../../types/types';

export type ReadServices = StripFactory<IocGeneratedTypes['readServiceFactories']>;

export type GraphQLContextViewer = {
  id: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  isAuthenticated: boolean;
};

export interface GraphQLContext {
  viewer?: GraphQLContextViewer;
  writeServices?: IocGeneratedTypes['writeServices'];
  readServices?: ReadServices;
}

export type AuthenticatedGraphQLContext = GraphQLContext & {
  viewer: GraphQLContextViewer;
  writeServices: IocGeneratedTypes['writeServices'];
  readServices: ReadServices;
};

export type GraphQLInitialContext = YogaInitialContext &
  Koa.Context & { state: { isLoggedIn: boolean; user: User } };

export interface GraphQLContextFactory {
  (initialContext: GraphQLInitialContext): GraphQLContext;
}
