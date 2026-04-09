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

    MediaItemReadRepository: {
      mediaItemReadRepository: { lifetime: 'scoped' },
    },
    MediaAssetReadRepository: {
      mediaAssetReadRepository: { lifetime: 'scoped' },
    },
    MediaAssetRepository: {
      mediaAssetRepository: { lifetime: 'scoped' },
    },
    ViewerMediaItemReadServiceFactory: {
      viewerMediaItemReadServiceFactory: { lifetime: 'scoped' },
    },
    AlbumReadRepository: {
      albumReadRepository: { lifetime: 'scoped' },
    },
    ViewerAlbumReadServiceFactory: {
      viewerAlbumReadServiceFactory: { lifetime: 'scoped' },
    },
    Knex: {
      $contract: { accessKey: 'database' },
    },
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
