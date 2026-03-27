import { defineIocConfig } from "ioc-manifest";

export default defineIocConfig({
  discovery: {
    rootDir: "src",
    generatedDir: "di/generated",
    includes: ["**/*.{ts,tsx}"],
    excludes: [
      "**/*.d.ts",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "di/generated/**",
      "dist/**",
      "**/node_modules/**",
      "application/writeServices/**",
    ],
    factoryPrefix: "build",
  },
  registrations: {
    MediaStorage: {
      localMediaStorage: { name: "mediaStorage" },
    },
    AlbumReadRepository: {
      albumReadRepository: { lifetime: "scoped" },
    },
    MediaItemReadRepository: {
      mediaItemReadRepository: { lifetime: "scoped" },
    },
    AlbumService: {
      albumService: { name: "albumService", lifetime: "scoped" },
    },
    BindViewerReadServices: {
      bindViewerReadServices: {
        name: "bindViewerReadServices",
        lifetime: "scoped",
      },
    },
    AuthMiddleware: {
      authMiddleware: { default: true },
      optionalAuthMiddleware: {},
    },
  },
});
