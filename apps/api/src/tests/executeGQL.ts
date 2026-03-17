import { yoga } from "../graphql/server/createGraphQLServer";
import { createMockGraphQLContext } from "./createMockGraphQLContext";

interface GraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

// Using any for test helper flexibility - tests will add their own type assertions
export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: GraphQLError[];
}

// Using any for test helper flexibility - tests will add their own type assertions
export const executeGraphQL = async <T = any>({
  query,
  variables,
  context,
}: {
  query: string;
  variables?: Record<string, unknown>;
  context?: Record<string, unknown>;
}): Promise<{ response: Response; json: GraphQLResponse<T> }> => {
  const response = await yoga.fetch(
    "http://localhost/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    },
    createMockGraphQLContext(context),
  );

  const json = (await response.json()) as GraphQLResponse<T>;

  return { response, json };
};
