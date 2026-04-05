import { defineIocConfig } from 'ioc-manifest';

export default defineIocConfig({
  discovery: {
    rootDir: 'src',
    generatedDir: 'di/generated',
    includes: ['**/*.{ts,tsx}'],
    excludes: [
      '**/*.d.ts',
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
      'di/generated/**',
      'dist/**',
      '**/node_modules/**',
    ],
    factoryPrefix: 'build',
  },
  registrations: {
    MediaStorage: {
      localMediaStorage: { default: true },
    },
    AlbumReadRepository: {
      albumReadRepository: { lifetime: 'scoped' },
    },
    MediaItemReadRepository: {
      mediaItemReadRepository: { lifetime: 'scoped' },
    },
    ViewerAlbumReadServiceFactory: {
      viewerAlbumReadServiceFactory: { lifetime: 'scoped' },
    },
    Knex: {
      $contract: { accessKey: 'database' },
    },
    // BindViewerReadServices: {
    //   bindViewerReadServices: {
    //     name: "bindViewerReadServices",
    //     lifetime: "scoped",
    //   },
    // },
    AuthMiddleware: {
      // Keep strict middleware under a distinct key so `authMiddleware` (contract default slot) aliases to optional.
      authMiddleware: { name: 'strictAuthMiddleware' },
      optionalAuthMiddleware: { default: true },
    },
  },
  groups: {
    readServiceFactories: {
      kind: 'object',
      baseType: 'ReadServiceFactoryBase',
    },
    writeServices: {
      kind: 'object',
      baseType: 'WriteServiceBase',
    },
  },
});
