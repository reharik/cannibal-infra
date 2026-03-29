/* AUTO-GENERATED. DO NOT EDIT.
Primary container manifest (human-oriented). Registration bindings and bundle insight: ioc-manifest.support.ts
Re-run `npm run gen:manifest` after adding/removing injectable factories.
*/
import type {
  IocGeneratedContainerManifest,
  IocModuleNamespace,
} from "ioc-manifest";

import * as ioc_application_readServices_viewerReadServices_albumService from "../../application/readServices/viewerReadServices/albumService.js";
import * as ioc_config from "../../config.js";
import * as ioc_controllers_authController from "../../controllers/authController.js";
import * as ioc_controllers_mediaController from "../../controllers/mediaController.js";
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
import * as ioc_routes_apiRoutes from "../../routes/apiRoutes.js";
import * as ioc_routes_authRoutes from "../../routes/authRoutes.js";
import * as ioc_routes_mediaRoutes from "../../routes/mediaRoutes.js";
import * as ioc_server from "../../server.js";
import * as ioc_services_authService from "../../services/authService.js";

export const iocManifest = {
  moduleImports: [
    ioc_application_readServices_viewerReadServices_albumService,
    ioc_config,
    ioc_controllers_authController,
    ioc_controllers_mediaController,
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
    ioc_routes_apiRoutes,
    ioc_routes_authRoutes,
    ioc_routes_mediaRoutes,
    ioc_server,
    ioc_services_authService,
  ] as const satisfies readonly IocModuleNamespace[],

  contracts: {
    // AlbumReadRepository
    AlbumReadRepository: {
      albumReadRepository: {
        exportName: "buildAlbumReadRepository",
        registrationKey: "albumReadRepository",
        sourceFile: "repositories/readRepositories/albumReadRepository.ts",
        lifetime: "scoped",
        default: true,
        discoveredBy: "naming",
        configOverridesApplied: ["lifetime"],
        dependencyContractNames: ["Knex"],
      },
    },

    // AlbumRepository
    AlbumRepository: {
      albumRepository: {
        exportName: "buildAlbumRepository",
        registrationKey: "albumRepository",
        sourceFile: "repositories/domainRepositories/albumRepository.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["Knex"],
      },
    },

    // AlbumService
    AlbumService: {
      albumService: {
        exportName: "buildAlbumService",
        registrationKey: "albumService",
        sourceFile:
          "application/readServices/viewerReadServices/albumService.ts",
        lifetime: "scoped",
        default: true,
        discoveredBy: "naming",
        configOverridesApplied: ["name", "lifetime"],
        dependencyContractNames: [
          "AlbumReadRepository",
          "MediaItemReadRepository",
        ],
      },
    },

    // AuthController
    AuthController: {
      authController: {
        exportName: "buildAuthController",
        registrationKey: "authController",
        sourceFile: "controllers/authController.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["AuthService", "Logger"],
      },
    },

    // AuthMiddleware
    AuthMiddleware: {
      authMiddleware: {
        exportName: "buildAuthMiddleware",
        registrationKey: "authMiddleware",
        sourceFile: "middleware/authMiddleware.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        configOverridesApplied: ["default"],
        dependencyContractNames: ["AuthService", "Logger"],
      },
      optionalAuthMiddleware: {
        exportName: "buildOptionalAuthMiddleware",
        registrationKey: "optionalAuthMiddleware",
        sourceFile: "middleware/authMiddleware.ts",
        lifetime: "singleton",
        discoveredBy: "naming",
        dependencyContractNames: ["AuthService"],
      },
    },

    // AuthRoutes
    AuthRoutes: {
      authRoutes: {
        exportName: "buildAuthRoutes",
        registrationKey: "authRoutes",
        sourceFile: "routes/authRoutes.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["AuthController"],
      },
    },

    // AuthService
    AuthService: {
      authService: {
        exportName: "buildAuthService",
        registrationKey: "authService",
        sourceFile: "services/authService.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["Config", "Knex", "Logger"],
      },
    },

    // CommentRepository
    CommentRepository: {
      commentRepository: {
        exportName: "buildCommentRepository",
        registrationKey: "commentRepository",
        sourceFile: "repositories/domainRepositories/commentRepository.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["Knex"],
      },
    },

    // Config
    Config: {
      config: {
        exportName: "buildConfig",
        registrationKey: "config",
        sourceFile: "config.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
      },
    },

    // ErrorHandler
    ErrorHandler: {
      errorHandler: {
        exportName: "buildErrorHandler",
        registrationKey: "errorHandler",
        sourceFile: "middleware/errorHandler.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["Logger"],
      },
    },

    // GraphQLContextFactory
    GraphQLContextFactory: {
      graphQLContext: {
        exportName: "buildGraphQLContext",
        registrationKey: "graphQLContext",
        sourceFile: "graphql/context/createGraphQLContext.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
      },
    },

    // GraphQLServer
    GraphQLServer: {
      graphQLServer: {
        exportName: "buildGraphQLServer",
        registrationKey: "graphQLServer",
        sourceFile: "graphql/server/createGraphQLServer.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["YogaApp"],
      },
    },

    // Knex
    Knex: {
      database: {
        exportName: "buildDatabase",
        registrationKey: "database",
        sourceFile: "knex.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["Config"],
      },
    },

    // KnexConfig
    KnexConfig: {
      knexConfig: {
        exportName: "buildKnexConfig",
        registrationKey: "knexConfig",
        sourceFile: "knexfile.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["Config"],
      },
    },

    // KoaServer
    KoaServer: {
      koaServer: {
        exportName: "buildKoaServer",
        registrationKey: "koaServer",
        sourceFile: "koaServer.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: [
          "AuthMiddleware",
          "Config",
          "ErrorHandler",
          "GraphQLServer",
          "Knex",
          "Logger",
          "RequestLogger",
        ],
      },
    },

    // Logger
    Logger: {
      logger: {
        exportName: "buildLogger",
        registrationKey: "logger",
        sourceFile: "logger.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["Config"],
      },
    },

    // MediaController
    MediaController: {
      mediaController: {
        exportName: "buildMediaController",
        registrationKey: "mediaController",
        sourceFile: "controllers/mediaController.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
      },
    },

    // MediaItemReadRepository
    MediaItemReadRepository: {
      mediaItemReadRepository: {
        exportName: "buildMediaItemReadRepository",
        registrationKey: "mediaItemReadRepository",
        sourceFile: "repositories/readRepositories/mediaItemReadRepository.ts",
        lifetime: "scoped",
        default: true,
        discoveredBy: "naming",
        configOverridesApplied: ["lifetime"],
        dependencyContractNames: ["Knex"],
      },
    },

    // MediaItemRepository
    MediaItemRepository: {
      mediaItemRepository: {
        exportName: "buildMediaItemRepository",
        registrationKey: "mediaItemRepository",
        sourceFile: "repositories/domainRepositories/mediaItemRepository.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["Knex"],
      },
    },

    // MediaRoutes
    MediaRoutes: {
      mediaRoutes: {
        exportName: "buildMediaRoutes",
        registrationKey: "mediaRoutes",
        sourceFile: "routes/mediaRoutes.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["MediaController"],
      },
    },

    // MediaStorage
    MediaStorage: {
      localMediaStorage: {
        exportName: "buildLocalMediaStorage",
        registrationKey: "mediaStorage",
        sourceFile: "infrastructure/media/localMediaStorage.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        configOverridesApplied: ["name"],
        dependencyContractNames: ["Config"],
      },
    },

    // NotificationRepository
    NotificationRepository: {
      notificationRepository: {
        exportName: "buildNotificationRepository",
        registrationKey: "notificationRepository",
        sourceFile: "repositories/domainRepositories/notificationRepository.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["Knex"],
      },
    },

    // RequestLogger
    RequestLogger: {
      requestLogger: {
        exportName: "buildRequestLogger",
        registrationKey: "requestLogger",
        sourceFile: "middleware/requestLogger.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["Logger"],
      },
    },

    // Router
    Router: {
      apiRoutes: {
        exportName: "buildApiRoutes",
        registrationKey: "apiRoutes",
        sourceFile: "routes/apiRoutes.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
      },
    },

    // Server
    Server: {
      server: {
        exportName: "buildServer",
        registrationKey: "server",
        sourceFile: "server.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["Config", "KoaServer", "Logger"],
      },
    },

    // ShareLinkRepository
    ShareLinkRepository: {
      shareLinkRepository: {
        exportName: "buildShareLinkRepository",
        registrationKey: "shareLinkRepository",
        sourceFile: "repositories/domainRepositories/shareLinkRepository.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["Knex"],
      },
    },

    // UserRepository
    UserRepository: {
      userRepository: {
        exportName: "buildUserRepository",
        registrationKey: "userRepository",
        sourceFile: "repositories/domainRepositories/userRepository.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["Knex"],
      },
    },

    // YogaApp
    YogaApp: {
      yogaApp: {
        exportName: "buildYogaApp",
        registrationKey: "yogaApp",
        sourceFile: "graphql/server/createGraphQLServer.ts",
        lifetime: "singleton",
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["GraphQLContextFactory"],
      },
    },
  },
  bundles: {
    routes: [
      {
        contractName: "AuthRoutes",
        registrationKey: "authRoutes",
      },
      {
        contractName: "MediaRoutes",
        registrationKey: "mediaRoutes",
      },
    ],
    readServices: [
      {
        contractName: "AlbumService",
        registrationKey: "albumService",
      },
    ],
  },
} as const satisfies IocGeneratedContainerManifest;
