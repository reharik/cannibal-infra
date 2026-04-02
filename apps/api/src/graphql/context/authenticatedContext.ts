import { AuthenticatedGraphQLContext, GraphQLContext } from './types';

export const requireAuthenticatedContext = (ctx: GraphQLContext): AuthenticatedGraphQLContext => {
  if (!ctx.viewer || !ctx.writeServices || !ctx.readServices) {
    throw new Error('Not authenticated');
  }

  return {
    ...ctx,
    viewer: ctx.viewer,
    writeServices: ctx.writeServices,
  } as AuthenticatedGraphQLContext;
};

export const authenticatedMutation =
  <TArgs, TResult>(
    resolver: (parent: unknown, args: TArgs, ctx: AuthenticatedGraphQLContext) => Promise<TResult>,
  ) =>
  async (parent: unknown, args: TArgs, ctx: GraphQLContext): Promise<TResult> => {
    const authCtx = requireAuthenticatedContext(ctx);
    return resolver(parent, args, authCtx);
  };
