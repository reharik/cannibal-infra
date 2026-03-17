import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CodegenConfig } from "@graphql-codegen/cli";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: CodegenConfig = {
  schema: path.join(__dirname, "src/graphql/schema/**/*.graphql"),
  generates: {
    [path.join(__dirname, "src/graphql/generated/types.generated.ts")]: {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        contextType: "../context/createGraphQLContext#GraphQLContext",
        useIndexSignature: true,
      },
    },
  },
};

export default config;
