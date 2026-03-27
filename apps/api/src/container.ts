import { AwilixContainer, createContainer } from "awilix";
import { registerIocFromManifest } from "ioc-manifest";
import {
  iocManifestByContract,
  iocModuleImports,
} from "./di/generated/ioc-manifest";
import type { IocGeneratedCradle } from "./di/generated/ioc-registry.types";

let container: AwilixContainer<IocGeneratedCradle> | undefined;

const initializeContainer = (): AwilixContainer<IocGeneratedCradle> => {
  if (container) {
    return container;
  }

  const _container = createContainer<IocGeneratedCradle>({
    injectionMode: "PROXY",
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- ioc-manifest runtime registration
  registerIocFromManifest(_container, iocManifestByContract, iocModuleImports);

  container = _container;
  return container;
};

const getContainer = (): AwilixContainer<IocGeneratedCradle> => {
  if (!container) {
    throw new Error(
      "[ioc] container has not been initialized yet. Call initializeContainer() first.",
    );
  }

  return container;
};

export { initializeContainer, getContainer };
