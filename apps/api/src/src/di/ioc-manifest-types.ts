export type IocModuleNamespace = Record<string, unknown>;

export type IocManifestEntry = {
  modulePath: string;
  exports: IocModuleNamespace;
};

export type IocManifest = IocManifestEntry[];
