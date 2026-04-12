import { generateManifest } from 'ioc-manifest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const run = async (): Promise<void> => {
  await generateManifest({ paths: { projectRoot } });
};

run().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
