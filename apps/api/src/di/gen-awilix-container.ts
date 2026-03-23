import fg from "fast-glob";
import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import { fileURLToPath } from "node:url";

type Entry = {
  key: string;
  relImport: string;
  exportName: string;
  ifaceName?: string;
  ifaceFound: boolean;
  sourcePath: string;
  group?: string;
};

type ManifestModuleEntry = {
  sourcePath: string;
  relImport: string;
  modulePath: string;
};

type ResolverMetadata = {
  name?: string;
  group?: string;
};

const here = path.dirname(fileURLToPath(import.meta.url));
// Script is at src/di — source root is one level up, not src/src.
const srcDir = path.resolve(here, "..");
const diDir = path.join(srcDir, "di");
const generatedDir = path.join(diDir, "generated");

const awilixOutPath = path.join(generatedDir, "awilix.autoload.d.ts");
const manifestOutPath = path.join(generatedDir, "ioc-manifest.ts");
const manifestTypesPath = path.join(diDir, "ioc-manifest-types.ts");

const PATTERNS = ["**/*.{ts,tsx,js,mjs,cjs}"];

const EXCLUDE_PATTERNS = [
  "**/*.d.ts",
  "**/*.test.{ts,tsx,js,mjs,cjs}",
  "**/*.spec.{ts,tsx,js,mjs,cjs}",
  "di/generated/**/*",
  "dist/**/*",
  "node_modules/**/*",
];

const formatName = (name: string): string => {
  if (name.startsWith("build") && name.length > 5) {
    const rest = name.slice(5);
    return rest.charAt(0).toLowerCase() + rest.slice(1);
  }

  return name.charAt(0).toLowerCase() + name.slice(1);
};

const expectedInterfaceFromExport = (
  exportName: string,
): string | undefined => {
  return exportName.startsWith("build") ? exportName.slice(5) : undefined;
};

const hasExportedInterfaceOrType = (
  source: string,
  ifaceName: string,
): boolean => {
  const reInterface = new RegExp(
    String.raw`export\s+(?:declare\s+)?interface\s+${ifaceName}\b`,
    "m",
  );
  const reType = new RegExp(
    String.raw`export\s+(?:declare\s+)?type\s+${ifaceName}\s*=`,
    "m",
  );
  const reNamed = new RegExp(String.raw`export\s*\{\s*([^}]+)\s*\}`, "m");

  if (reInterface.test(source) || reType.test(source)) return true;

  const match = source.match(reNamed);
  if (match) {
    const items = match[1].split(",").map((s) => s.trim());

    for (const item of items) {
      const namedMatch = item.match(/^(\w+)(?:\s+as\s+(\w+))?$/);
      if (!namedMatch) continue;

      const [, orig, alias] = namedMatch;
      if (orig === ifaceName || alias === ifaceName) {
        return true;
      }
    }
  }

  return false;
};

const toPosix = (value: string): string => value.replace(/\\/g, "/");

const relImportFromGeneratedDir = (absFile: string): string => {
  let rel = path.relative(generatedDir, absFile);
  rel = toPosix(rel).replace(/\.[^.]+$/, "");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
};

const modulePathFromSrc = (absFile: string): string =>
  toPosix(path.relative(srcDir, absFile));

const buildManifestModules = (entries: Entry[]): ManifestModuleEntry[] => {
  const seen = new Map<string, ManifestModuleEntry>();

  for (const entry of entries) {
    if (seen.has(entry.sourcePath)) continue;

    seen.set(entry.sourcePath, {
      sourcePath: entry.sourcePath,
      relImport: entry.relImport,
      modulePath: modulePathFromSrc(entry.sourcePath),
    });
  }

  return Array.from(seen.values()).sort((a, b) =>
    a.modulePath.localeCompare(b.modulePath),
  );
};

const ensureManifestTypesFile = async (): Promise<void> => {
  const content = `export type IocModuleNamespace = Record<string, unknown>;

export type IocManifestEntry = {
  modulePath: string;
  exports: IocModuleNamespace;
};

export type IocManifest = IocManifestEntry[];
`;

  try {
    await fs.access(manifestTypesPath);
  } catch {
    await fs.writeFile(manifestTypesPath, content, "utf8");
  }
};

const ensureManifestStubFile = async (): Promise<void> => {
  const stub = `/* AUTO-GENERATED. DO NOT EDIT. */

import type { IocManifest } from "../ioc-manifest-types";

export const iocManifest: IocManifest = [];
`;

  try {
    await fs.access(manifestOutPath);
  } catch {
    await fs.writeFile(manifestOutPath, stub, "utf8");
  }
};

const isExportedNode = (node: ts.Node): boolean => {
  const modifiers = ts.canHaveModifiers(node)
    ? ts.getModifiers(node)
    : undefined;
  return !!modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
};

const getExportedDeclarationNames = (
  sourceFile: ts.SourceFile,
): Set<string> => {
  const names = new Set<string>();

  const visit = (node: ts.Node): void => {
    if (ts.isVariableStatement(node) && isExportedNode(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          names.add(decl.name.text);
        }
      }
    }

    if (
      (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node)) &&
      node.name &&
      isExportedNode(node)
    ) {
      names.add(node.name.text);
    }

    if (
      ts.isExportDeclaration(node) &&
      node.exportClause &&
      ts.isNamedExports(node.exportClause)
    ) {
      for (const element of node.exportClause.elements) {
        names.add(element.name.text);
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return names;
};

/** Resolves `foo`, `(foo as any)`, `((foo as any))` for resolver assignment LHS. */
const getIdentifierTextFromExpression = (
  expr: ts.Expression,
): string | undefined => {
  if (ts.isIdentifier(expr)) {
    return expr.text;
  }
  if (ts.isParenthesizedExpression(expr)) {
    return getIdentifierTextFromExpression(expr.expression);
  }
  if (ts.isAsExpression(expr)) {
    return getIdentifierTextFromExpression(expr.expression);
  }
  return undefined;
};

const isResolverTaggedElementAccess = (
  node: ts.Expression,
): node is ts.ElementAccessExpression => {
  if (!ts.isElementAccessExpression(node)) {
    return false;
  }
  if (!ts.isIdentifier(node.argumentExpression)) {
    return false;
  }
  if (node.argumentExpression.text !== "RESOLVER") {
    return false;
  }
  return getIdentifierTextFromExpression(node.expression) !== undefined;
};

const getStringPropertyFromObjectLiteral = (
  objectLiteral: ts.ObjectLiteralExpression,
  propertyName: string,
): string | undefined => {
  for (const prop of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;

    const name = prop.name;
    const isMatch =
      (ts.isIdentifier(name) && name.text === propertyName) ||
      (ts.isStringLiteral(name) && name.text === propertyName);

    if (!isMatch) continue;

    const initializer = prop.initializer;
    if (
      ts.isStringLiteral(initializer) ||
      ts.isNoSubstitutionTemplateLiteral(initializer)
    ) {
      return initializer.text;
    }
  }

  return undefined;
};

const getResolverAssignments = (
  sourceFile: ts.SourceFile,
): Map<string, ResolverMetadata> => {
  const map = new Map<string, ResolverMetadata>();

  const visit = (node: ts.Node): void => {
    if (
      ts.isExpressionStatement(node) &&
      ts.isBinaryExpression(node.expression) &&
      node.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      isResolverTaggedElementAccess(node.expression.left)
    ) {
      const exportName = getIdentifierTextFromExpression(
        node.expression.left.expression,
      );
      if (exportName) {
        const right = node.expression.right;

        if (ts.isObjectLiteralExpression(right)) {
          map.set(exportName, {
            name: getStringPropertyFromObjectLiteral(right, "name"),
            group: getStringPropertyFromObjectLiteral(right, "group"),
          });
        } else {
          map.set(exportName, {});
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return map;
};

const discoverEntriesFromFile = async (absPath: string): Promise<Entry[]> => {
  const source = await fs.readFile(absPath, "utf8");

  if (!source.includes("RESOLVER")) {
    return [];
  }

  const sourceFile = ts.createSourceFile(
    absPath,
    source,
    ts.ScriptTarget.Latest,
    true,
  );

  const exportedNames = getExportedDeclarationNames(sourceFile);
  const resolverAssignments = getResolverAssignments(sourceFile);

  const entries: Entry[] = [];

  for (const [exportName, resolverMeta] of resolverAssignments.entries()) {
    if (!exportedNames.has(exportName)) {
      continue;
    }

    const key =
      typeof resolverMeta.name === "string" && resolverMeta.name.length > 0
        ? resolverMeta.name
        : formatName(exportName);

    const ifaceName = expectedInterfaceFromExport(exportName);
    const ifaceFound = ifaceName
      ? hasExportedInterfaceOrType(source, ifaceName)
      : false;

    entries.push({
      key,
      relImport: relImportFromGeneratedDir(absPath),
      exportName,
      ifaceName,
      ifaceFound,
      sourcePath: absPath,
      group: resolverMeta.group,
    });
  }

  return entries;
};

const generateAwilixAutoloadDts = async (entries: Entry[]): Promise<void> => {
  const header = `/* AUTO-GENERATED. DO NOT EDIT.
Re-run \`npm run gen:container\` after adding/removing resolver-tagged modules.
*/
`;

  const regularEntries = entries.filter((e) => !e.group);
  const groupedEntries = entries.filter((e) => e.group);

  const groups = new Map<string, Entry[]>();
  for (const entry of groupedEntries) {
    if (!entry.group) continue;
    if (!groups.has(entry.group)) groups.set(entry.group, []);
    groups.get(entry.group)!.push(entry);
  }

  let body = "";

  for (const entry of regularEntries) {
    const capKey = entry.key.charAt(0).toUpperCase() + entry.key.slice(1);

    if (entry.ifaceName && entry.ifaceFound) {
      body += `type ${capKey} = import("${entry.relImport}").${entry.ifaceName};\n\n`;
    } else {
      body += `type ${capKey}Type = typeof import("${entry.relImport}")["${entry.exportName}"];
type ${capKey} =
  ${capKey}Type extends new (...args: unknown[]) => infer I ? I :
  ${capKey}Type extends (...args: unknown[]) => infer R ? R :
  ${capKey}Type extends { (...args: unknown[]): infer C } ? C :
  unknown;

`;
    }
  }

  for (const [groupName, groupEntries] of groups) {
    const capGroupName = groupName.charAt(0).toUpperCase() + groupName.slice(1);

    body += `type ${capGroupName} = {\n`;
    for (const entry of groupEntries) {
      if (entry.ifaceName && entry.ifaceFound) {
        body += `  ${entry.key}: import("${entry.relImport}").${entry.ifaceName};\n`;
      } else {
        body += `  ${entry.key}: ReturnType<typeof import("${entry.relImport}")["${entry.exportName}"]>;\n`;
      }
    }
    body += `};\n\n`;
  }

  const fields: string[] = [];

  for (const entry of regularEntries) {
    const capKey = entry.key.charAt(0).toUpperCase() + entry.key.slice(1);
    fields.push(`  ${entry.key}: ${capKey};`);
  }

  for (const [groupName] of groups) {
    const capGroupName = groupName.charAt(0).toUpperCase() + groupName.slice(1);
    fields.push(`  ${groupName}: ${capGroupName};`);
  }

  const fieldsStr =
    fields.length === 0
      ? "  // (no autoloaded items discovered)"
      : fields.join("\n");

  const out =
    header + body + `export interface AutoLoadedContainer {\n${fieldsStr}\n}\n`;

  await fs.writeFile(awilixOutPath, out, "utf8");
};

const generateIocManifest = async (entries: Entry[]): Promise<void> => {
  const header = `/* AUTO-GENERATED. DO NOT EDIT.
Re-run \`npm run gen:container\` after adding/removing resolver-tagged modules.
*/
`;

  const modules = buildManifestModules(entries);

  const importLines = modules.map(
    (moduleEntry, index) =>
      `import * as module${index + 1} from "${moduleEntry.relImport}";`,
  );

  const manifestItems = modules.map(
    (moduleEntry, index) => `  {
    modulePath: "${moduleEntry.modulePath}",
    exports: module${index + 1},
  },`,
  );

  const out = `${header}
import type { IocManifest } from "../ioc-manifest-types";
${importLines.join("\n")}

export const iocManifest: IocManifest = [
${manifestItems.join("\n")}
];
`;

  await fs.writeFile(manifestOutPath, out, "utf8");
};

const run = async (): Promise<void> => {
  await fs.mkdir(generatedDir, { recursive: true });
  await ensureManifestTypesFile();
  await ensureManifestStubFile();

  const allFiles = await fg(PATTERNS, {
    cwd: srcDir,
    absolute: true,
  });

  const excludedFiles = await fg(EXCLUDE_PATTERNS, {
    cwd: srcDir,
    absolute: true,
  });

  const excludedSet = new Set(excludedFiles);
  const files = allFiles.filter((file) => !excludedSet.has(file));

  const seenKeys = new Set<string>();
  const entries: Entry[] = [];

  for (const abs of files) {
    const discovered = await discoverEntriesFromFile(abs);

    for (const entry of discovered) {
      if (seenKeys.has(entry.key)) {
        continue;
      }
      seenKeys.add(entry.key);
      entries.push(entry);
    }
  }

  entries.sort((a, b) => {
    if (a.key !== b.key) return a.key.localeCompare(b.key);
    if (a.sourcePath !== b.sourcePath) {
      return a.sourcePath.localeCompare(b.sourcePath);
    }
    return a.exportName.localeCompare(b.exportName);
  });

  await generateAwilixAutoloadDts(entries);
  await generateIocManifest(entries);

  try {
    const { execSync } = await import("node:child_process");
    execSync(`npx prettier --write "${awilixOutPath}" "${manifestOutPath}"`, {
      stdio: "inherit",
    });
  } catch (error) {
    console.warn(
      `Failed to format generated files: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  console.log(
    `Generated ${path.relative(process.cwd(), awilixOutPath)} and ${path.relative(process.cwd(), manifestOutPath)} from ${entries.length} resolver exports.`,
  );
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
