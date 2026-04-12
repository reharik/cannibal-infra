import { mergeResolvers } from '@graphql-tools/merge';
import fg from 'fast-glob';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Resolvers } from '../generated/types.generated.js';

/**
 * Jest (ESM / experimental VM modules): modules reached only via dynamic `import()` are not
 * “linked,” so bare specifiers in their dependency tree (e.g. `@packages/contracts` inside
 * shared helpers) may fail to resolve. Statically import shared resolver dependencies here so
 * they participate in the normal graph before we merge dynamically discovered *Resolver modules.
 */
import './standardizeInput.js';

export const resolvers = await loadResolvers();

async function loadResolvers() {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const resolverPattern = join(currentDir, '**', '*Resolver.{ts,js}');

  const resolverFiles = await fg(resolverPattern);

  const resolversArray = await Promise.all(
    resolverFiles.map(async (file) => {
      const rel = relative(currentDir, file).replace(/\\/g, '/');
      const module = (await import(`./${rel}`)) as {
        default: Partial<Resolvers>;
      };
      return module.default;
    }),
  );

  return mergeResolvers(resolversArray);
}
