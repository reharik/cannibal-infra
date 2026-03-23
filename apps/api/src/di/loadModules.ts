import type { AwilixContainer, ResolverOptions } from "awilix";
import { asFunction, Lifetime, RESOLVER } from "awilix";
import { config } from "../config";
import { iocManifest } from "./generated/ioc-manifest";
import type { IocManifest } from "./ioc-manifest-types";
import type { LoggerInterface } from "../logger";

type ExtendedResolverOptions = ResolverOptions<unknown> & {
  name?: string;
  group?: string;
};

type ResolverTaggedFunction = ((...args: unknown[]) => unknown) & {
  [RESOLVER]?: ExtendedResolverOptions;
};

const isResolverTaggedFunction = (
  value: unknown,
): value is ResolverTaggedFunction => {
  return typeof value === "function" && RESOLVER in value;
};

const formatName = (exportName: string): string => {
  if (exportName.startsWith("build") && exportName.length > 5) {
    const rest = exportName.slice(5);
    return rest.charAt(0).toLowerCase() + rest.slice(1);
  }

  return exportName.charAt(0).toLowerCase() + exportName.slice(1);
};

const getRegistrationName = (
  exportName: string,
  resolverOptions?: ExtendedResolverOptions,
): string => {
  return resolverOptions?.name ?? formatName(exportName);
};

const registerModuleExports = (
  container: AwilixContainer,
  modulePath: string,
  moduleExports: Record<string, unknown>,
  logger: LoggerInterface,
): void => {
  for (const [exportName, value] of Object.entries(moduleExports)) {
    if (!isResolverTaggedFunction(value)) {
      continue;
    }

    const resolverOptions = value[RESOLVER] ?? {};
    const registrationName = getRegistrationName(exportName, resolverOptions);

    logger.debug("[loadModules] Registering tagged factory", {
      modulePath,
      exportName,
      registrationName,
      lifetime: resolverOptions.lifetime,
      group: resolverOptions.group,
    });

    container.register({
      [registrationName]: asFunction(value, resolverOptions),
    });
  }
};

type GroupedRegistrationNames = Record<string, Set<string>>;

let cachedModules: IocManifest | null = null;

const getCachedModules = async (
  logger: LoggerInterface,
): Promise<IocManifest> => {
  if (cachedModules === null) {
    logger.info("[loadModules] Using generated IoC manifest", {
      nodeEnv: config.nodeEnv,
      moduleCount: iocManifest.length,
      sampleKeys: iocManifest.slice(0, 20).map((entry) => entry.modulePath),
    });

    cachedModules = iocManifest;
  }

  return cachedModules;
};

/**
 * Registers all exports tagged with [RESOLVER] from the generated manifest.
 */
export const registerTaggedModules = async (
  container: AwilixContainer,
  logger: LoggerInterface,
): Promise<void> => {
  const modules = await getCachedModules(logger);

  for (const { modulePath, exports: moduleExports } of modules) {
    try {
      registerModuleExports(container, modulePath, moduleExports, logger);
    } catch (error) {
      logger.warn("[loadModules] Failed to register module exports", {
        modulePath,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  logger.info("[loadModules] Dynamic tagged registration complete", {
    registrationCount: Object.keys(container.registrations).length,
    registrations: Object.keys(container.registrations).slice(0, 50),
  });
};

/**
 * Call this after:
 * 1) registerTaggedModules(...)
 * 2) any explicit container.register(...) overrides
 *
 * It collects [RESOLVER].group values from the generated manifest
 * and registers grouped objects like:
 *
 *   readServices
 *   writeServices
 */
export const registerResolverGroups = async (
  container: AwilixContainer,
  logger: LoggerInterface,
): Promise<void> => {
  const modules = await getCachedModules(logger);
  const groupedNames: GroupedRegistrationNames = {};

  for (const { exports: moduleExports } of modules) {
    for (const [exportName, value] of Object.entries(moduleExports)) {
      if (!isResolverTaggedFunction(value)) {
        continue;
      }

      const resolverOptions = value[RESOLVER] ?? {};
      const groupName = resolverOptions.group;
      if (!groupName) {
        continue;
      }

      const registrationName = getRegistrationName(exportName, resolverOptions);

      groupedNames[groupName] ??= new Set<string>();
      groupedNames[groupName].add(registrationName);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupedRegistrations: Record<string, any> = {};

  for (const [groupName, names] of Object.entries(groupedNames)) {
    const namesArray = Array.from(names);

    groupedRegistrations[groupName] = asFunction(
      (cradle: Record<string, unknown>) => {
        const groupObject: Record<string, unknown> = {};

        for (const registrationName of namesArray) {
          if (!(registrationName in container.registrations)) {
            logger.warn("[loadModules] Group member missing from container", {
              groupName,
              registrationName,
            });
            continue;
          }

          groupObject[registrationName] = cradle[registrationName];
        }

        return groupObject;
      },
      { lifetime: Lifetime.SCOPED },
    );
  }

  if (Object.keys(groupedRegistrations).length > 0) {
    container.register(groupedRegistrations);
  }

  logger.info("[loadModules] Resolver groups registered", {
    groups: Object.fromEntries(
      Object.entries(groupedNames).map(([groupName, names]) => [
        groupName,
        Array.from(names),
      ]),
    ),
  });
};
