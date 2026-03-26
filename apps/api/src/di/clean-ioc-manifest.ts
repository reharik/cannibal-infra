// src/di/clean-ioc-manifest.ts
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const generatedDir = path.join(here, "generated");
const manifestPath = path.join(generatedDir, "ioc-manifest.ts");

const STUB = `/* AUTO-GENERATED. DO NOT EDIT. */

import type { IocManifest } from "../ioc-manifest-types";

export const iocManifest: IocManifest = [];
`;

const run = async (): Promise<void> => {
  await fs.mkdir(generatedDir, { recursive: true });
  await fs.writeFile(manifestPath, STUB, "utf8");
  console.log("[clean-ioc-manifest] Reset manifest to stub");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
