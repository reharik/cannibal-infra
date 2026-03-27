/* AUTO-GENERATED. DO NOT EDIT.
Re-run `npm run gen:manifest` after adding/removing injectable factories.
*/

import type { IocContractManifest } from "../../core/manifest.js";
import * as ioc_application_readServices_readService from "../../application/readServices/readService.js";
import * as ioc_application_readServices_viewerReadServices_albumService from "../../application/readServices/viewerReadServices/albumService.js";
import * as ioc_config from "../../config.js";
import * as ioc_controllers_authController from "../../controllers/authController.js";
import * as ioc_graphql_context_createGraphQLContext from "../../graphql/context/createGraphQLContext.js";
import * as ioc_graphql_server_createGraphQLServer from "../../graphql/server/createGraphQLServer.js";
import * as ioc_infrastructure_media_localMediaStorage from "../../infrastructure/media/localMediaStorage.js";
import * as ioc_knex from "../../knex.js";
import * as ioc_knexfile from "../../knexfile.js";
import * as ioc_koaServer from "../../koaServer.js";
import * as ioc_logger from "../../logger.js";
import * as ioc_middleware_authMiddleware from "../../middleware/authMiddleware.js";
import * as ioc_middleware_errorHandler from "../../middleware/errorHandler.js";
import * as ioc_middleware_requestLogger from "../../middleware/requestLogger.js";
import * as ioc_repositories_domainRepositories_albumRepository from "../../repositories/domainRepositories/albumRepository.js";
import * as ioc_repositories_domainRepositories_commentRepository from "../../repositories/domainRepositories/commentRepository.js";
import * as ioc_repositories_domainRepositories_mediaItemRepository from "../../repositories/domainRepositories/mediaItemRepository.js";
import * as ioc_repositories_domainRepositories_notificationRepository from "../../repositories/domainRepositories/notificationRepository.js";
import * as ioc_repositories_domainRepositories_shareLinkRepository from "../../repositories/domainRepositories/shareLinkRepository.js";
import * as ioc_repositories_domainRepositories_userRepository from "../../repositories/domainRepositories/userRepository.js";
import * as ioc_repositories_readRepositories_albumReadRepository from "../../repositories/readRepositories/albumReadRepository.js";
import * as ioc_repositories_readRepositories_mediaItemReadRepository from "../../repositories/readRepositories/mediaItemReadRepository.js";
import * as ioc_routes_authRoutes from "../../routes/authRoutes.js";
import * as ioc_routes_createRoutes from "../../routes/createRoutes.js";
import * as ioc_server from "../../server.js";
import * as ioc_services_authService from "../../services/authService.js";

export const iocModuleImports = [
  ioc_application_readServices_readService,
  ioc_application_readServices_viewerReadServices_albumService,
  ioc_config,
  ioc_controllers_authController,
  ioc_graphql_context_createGraphQLContext,
  ioc_graphql_server_createGraphQLServer,
  ioc_infrastructure_media_localMediaStorage,
  ioc_knex,
  ioc_knexfile,
  ioc_koaServer,
  ioc_logger,
  ioc_middleware_authMiddleware,
  ioc_middleware_errorHandler,
  ioc_middleware_requestLogger,
  ioc_repositories_domainRepositories_albumRepository,
  ioc_repositories_domainRepositories_commentRepository,
  ioc_repositories_domainRepositories_mediaItemRepository,
  ioc_repositories_domainRepositories_notificationRepository,
  ioc_repositories_domainRepositories_shareLinkRepository,
  ioc_repositories_domainRepositories_userRepository,
  ioc_repositories_readRepositories_albumReadRepository,
  ioc_repositories_readRepositories_mediaItemReadRepository,
  ioc_routes_authRoutes,
  ioc_routes_createRoutes,
  ioc_server,
  ioc_services_authService,
] as const;

export const iocManifestByContract: IocContractManifest = {
  AlbumReadRepository: {
    albumReadRepository: {
      exportName: "buildAlbumReadRepository",
      registrationKey: "albumReadRepository",
      modulePath: "repositories/readRepositories/albumReadRepository.ts",
      relImport: "../../repositories/readRepositories/albumReadRepository.js",
      contractName: "AlbumReadRepository",
      implementationName: "albumReadRepository",
      lifetime: "scoped",
      moduleIndex: 20,
      default: true,
    },
  },
  AlbumRepository: {
    albumRepository: {
      exportName: "buildAlbumRepository",
      registrationKey: "albumRepository",
      modulePath: "repositories/domainRepositories/albumRepository.ts",
      relImport: "../../repositories/domainRepositories/albumRepository.js",
      contractName: "AlbumRepository",
      implementationName: "albumRepository",
      lifetime: "singleton",
      moduleIndex: 14,
      default: true,
    },
  },
  AlbumService: {
    albumService: {
      exportName: "buildAlbumService",
      registrationKey: "albumService",
      modulePath: "application/readServices/viewerReadServices/albumService.ts",
      relImport:
        "../../application/readServices/viewerReadServices/albumService.js",
      contractName: "AlbumService",
      implementationName: "albumService",
      lifetime: "scoped",
      moduleIndex: 1,
      default: true,
    },
  },
  AuthController: {
    authController: {
      exportName: "buildAuthController",
      registrationKey: "authController",
      modulePath: "controllers/authController.ts",
      relImport: "../../controllers/authController.js",
      contractName: "AuthController",
      implementationName: "authController",
      lifetime: "singleton",
      moduleIndex: 3,
      default: true,
    },
  },
  AuthMiddleware: {
    authMiddleware: {
      exportName: "buildAuthMiddleware",
      registrationKey: "authMiddleware",
      modulePath: "middleware/authMiddleware.ts",
      relImport: "../../middleware/authMiddleware.js",
      contractName: "AuthMiddleware",
      implementationName: "authMiddleware",
      lifetime: "singleton",
      moduleIndex: 11,
      default: true,
    },
    optionalAuthMiddleware: {
      exportName: "buildOptionalAuthMiddleware",
      registrationKey: "optionalAuthMiddleware",
      modulePath: "middleware/authMiddleware.ts",
      relImport: "../../middleware/authMiddleware.js",
      contractName: "AuthMiddleware",
      implementationName: "optionalAuthMiddleware",
      lifetime: "singleton",
      moduleIndex: 11,
    },
  },
  AuthRoutes: {
    authRoutes: {
      exportName: "buildAuthRoutes",
      registrationKey: "authRoutes",
      modulePath: "routes/authRoutes.ts",
      relImport: "../../routes/authRoutes.js",
      contractName: "AuthRoutes",
      implementationName: "authRoutes",
      lifetime: "singleton",
      moduleIndex: 22,
      default: true,
    },
  },
  AuthService: {
    authService: {
      exportName: "buildAuthService",
      registrationKey: "authService",
      modulePath: "services/authService.ts",
      relImport: "../../services/authService.js",
      contractName: "AuthService",
      implementationName: "authService",
      lifetime: "singleton",
      moduleIndex: 25,
      default: true,
    },
  },
  BindViewerReadServices: {
    bindViewerReadServices: {
      exportName: "buildBindViewerReadServices",
      registrationKey: "bindViewerReadServices",
      modulePath: "application/readServices/readService.ts",
      relImport: "../../application/readServices/readService.js",
      contractName: "BindViewerReadServices",
      implementationName: "bindViewerReadServices",
      lifetime: "scoped",
      moduleIndex: 0,
      default: true,
    },
  },
  CommentRepository: {
    commentRepository: {
      exportName: "buildCommentRepository",
      registrationKey: "commentRepository",
      modulePath: "repositories/domainRepositories/commentRepository.ts",
      relImport: "../../repositories/domainRepositories/commentRepository.js",
      contractName: "CommentRepository",
      implementationName: "commentRepository",
      lifetime: "singleton",
      moduleIndex: 15,
      default: true,
    },
  },
  Config: {
    config: {
      exportName: "buildConfig",
      registrationKey: "config",
      modulePath: "config.ts",
      relImport: "../../config.js",
      contractName: "Config",
      implementationName: "config",
      lifetime: "singleton",
      moduleIndex: 2,
      default: true,
    },
  },
  ErrorHandler: {
    errorHandler: {
      exportName: "buildErrorHandler",
      registrationKey: "errorHandler",
      modulePath: "middleware/errorHandler.ts",
      relImport: "../../middleware/errorHandler.js",
      contractName: "ErrorHandler",
      implementationName: "errorHandler",
      lifetime: "singleton",
      moduleIndex: 12,
      default: true,
    },
  },
  GraphQLContextFactory: {
    graphQLContext: {
      exportName: "buildGraphQLContext",
      registrationKey: "graphQLContext",
      modulePath: "graphql/context/createGraphQLContext.ts",
      relImport: "../../graphql/context/createGraphQLContext.js",
      contractName: "GraphQLContextFactory",
      implementationName: "graphQLContext",
      lifetime: "singleton",
      moduleIndex: 4,
      default: true,
    },
  },
  GraphQLServer: {
    graphQLServer: {
      exportName: "buildGraphQLServer",
      registrationKey: "graphQLServer",
      modulePath: "graphql/server/createGraphQLServer.ts",
      relImport: "../../graphql/server/createGraphQLServer.js",
      contractName: "GraphQLServer",
      implementationName: "graphQLServer",
      lifetime: "singleton",
      moduleIndex: 5,
      default: true,
    },
  },
  Knex: {
    database: {
      exportName: "buildDatabase",
      registrationKey: "database",
      modulePath: "knex.ts",
      relImport: "../../knex.js",
      contractName: "Knex",
      implementationName: "database",
      lifetime: "singleton",
      moduleIndex: 7,
      default: true,
    },
  },
  KnexConfig: {
    knexConfig: {
      exportName: "buildKnexConfig",
      registrationKey: "knexConfig",
      modulePath: "knexfile.ts",
      relImport: "../../knexfile.js",
      contractName: "KnexConfig",
      implementationName: "knexConfig",
      lifetime: "singleton",
      moduleIndex: 8,
      default: true,
    },
  },
  KoaServer: {
    koaServer: {
      exportName: "buildKoaServer",
      registrationKey: "koaServer",
      modulePath: "koaServer.ts",
      relImport: "../../koaServer.js",
      contractName: "KoaServer",
      implementationName: "koaServer",
      lifetime: "singleton",
      moduleIndex: 9,
      default: true,
    },
  },
  Logger: {
    logger: {
      exportName: "buildLogger",
      registrationKey: "logger",
      modulePath: "logger.ts",
      relImport: "../../logger.js",
      contractName: "Logger",
      implementationName: "logger",
      lifetime: "singleton",
      moduleIndex: 10,
      default: true,
    },
  },
  MediaItemReadRepository: {
    mediaItemReadRepository: {
      exportName: "buildMediaItemReadRepository",
      registrationKey: "mediaItemReadRepository",
      modulePath: "repositories/readRepositories/mediaItemReadRepository.ts",
      relImport:
        "../../repositories/readRepositories/mediaItemReadRepository.js",
      contractName: "MediaItemReadRepository",
      implementationName: "mediaItemReadRepository",
      lifetime: "scoped",
      moduleIndex: 21,
      default: true,
    },
  },
  MediaItemRepository: {
    mediaItemRepository: {
      exportName: "buildMediaItemRepository",
      registrationKey: "mediaItemRepository",
      modulePath: "repositories/domainRepositories/mediaItemRepository.ts",
      relImport: "../../repositories/domainRepositories/mediaItemRepository.js",
      contractName: "MediaItemRepository",
      implementationName: "mediaItemRepository",
      lifetime: "singleton",
      moduleIndex: 16,
      default: true,
    },
  },
  MediaStorage: {
    localMediaStorage: {
      exportName: "buildLocalMediaStorage",
      registrationKey: "mediaStorage",
      modulePath: "infrastructure/media/localMediaStorage.ts",
      relImport: "../../infrastructure/media/localMediaStorage.js",
      contractName: "MediaStorage",
      implementationName: "localMediaStorage",
      lifetime: "singleton",
      moduleIndex: 6,
      default: true,
    },
  },
  NotificationRepository: {
    notificationRepository: {
      exportName: "buildNotificationRepository",
      registrationKey: "notificationRepository",
      modulePath: "repositories/domainRepositories/notificationRepository.ts",
      relImport:
        "../../repositories/domainRepositories/notificationRepository.js",
      contractName: "NotificationRepository",
      implementationName: "notificationRepository",
      lifetime: "singleton",
      moduleIndex: 17,
      default: true,
    },
  },
  RequestLogger: {
    requestLogger: {
      exportName: "buildRequestLogger",
      registrationKey: "requestLogger",
      modulePath: "middleware/requestLogger.ts",
      relImport: "../../middleware/requestLogger.js",
      contractName: "RequestLogger",
      implementationName: "requestLogger",
      lifetime: "singleton",
      moduleIndex: 13,
      default: true,
    },
  },
  Routes: {
    routes: {
      exportName: "buildRoutes",
      registrationKey: "routes",
      modulePath: "routes/createRoutes.ts",
      relImport: "../../routes/createRoutes.js",
      contractName: "Routes",
      implementationName: "routes",
      lifetime: "singleton",
      moduleIndex: 23,
      default: true,
    },
  },
  Server: {
    server: {
      exportName: "buildServer",
      registrationKey: "server",
      modulePath: "server.ts",
      relImport: "../../server.js",
      contractName: "Server",
      implementationName: "server",
      lifetime: "singleton",
      moduleIndex: 24,
      default: true,
    },
  },
  ShareLinkRepository: {
    shareLinkRepository: {
      exportName: "buildShareLinkRepository",
      registrationKey: "shareLinkRepository",
      modulePath: "repositories/domainRepositories/shareLinkRepository.ts",
      relImport: "../../repositories/domainRepositories/shareLinkRepository.js",
      contractName: "ShareLinkRepository",
      implementationName: "shareLinkRepository",
      lifetime: "singleton",
      moduleIndex: 18,
      default: true,
    },
  },
  UserRepository: {
    userRepository: {
      exportName: "buildUserRepository",
      registrationKey: "userRepository",
      modulePath: "repositories/domainRepositories/userRepository.ts",
      relImport: "../../repositories/domainRepositories/userRepository.js",
      contractName: "UserRepository",
      implementationName: "userRepository",
      lifetime: "singleton",
      moduleIndex: 19,
      default: true,
    },
  },
  YogaApp: {
    yogaApp: {
      exportName: "buildYogaApp",
      registrationKey: "yogaApp",
      modulePath: "graphql/server/createGraphQLServer.ts",
      relImport: "../../graphql/server/createGraphQLServer.js",
      contractName: "YogaApp",
      implementationName: "yogaApp",
      lifetime: "singleton",
      moduleIndex: 5,
      default: true,
    },
  },
};
