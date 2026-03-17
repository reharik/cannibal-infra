import {
  createYoga,
  // type YogaInitialContext,
} from "graphql-yoga";
import { schema } from "../schema";
import {
  createGraphQLContext,
  // type GraphQLContext,
} from "../context/createGraphQLContext";
import Koa from "koa";

export const yoga = createYoga<Koa.ParameterizedContext>({
  schema,
  context: createGraphQLContext,
});

export const createGraphQLServer = async (ctx: Koa.ParameterizedContext) => {
  const response = await yoga.handleNodeRequestAndResponse(
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
