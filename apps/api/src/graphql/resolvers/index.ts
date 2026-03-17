import { mergeResolvers } from "@graphql-tools/merge";
import fg from "fast-glob";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { Resolvers } from "../generated/types.generated.js";

export const resolvers = await loadResolvers();

async function loadResolvers() {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const resolverPattern = join(currentDir, "**", "*Resolver.{ts,js}");

  const resolverFiles = await fg(resolverPattern);

  const resolversArray = await Promise.all(
    resolverFiles.map(async (file) => {
      const module = (await import(file)) as {
        default: Partial<Resolvers>;
      };
      return module.default;
    }),
  );

  return mergeResolvers(resolversArray);
}
