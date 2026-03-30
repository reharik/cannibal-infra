/* AUTO-GENERATED. DO NOT EDIT.
Primary container manifest.
Re-run `npm run gen:manifest` after changing factories or IoC config.
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
import * as ioc_routes_apiRouter from "../../routes/apiRouter.js";
import * as ioc_routes_authRouter from "../../routes/authRouter.js";
import * as ioc_routes_mediaRouter from "../../routes/mediaRouter.js";
import * as ioc_server from "../../server.js";
import * as ioc_services_authService from "../../services/authService.js";

type IocManifestGroupRoots = {
  readonly readServiceFactories: {
    readonly albumServiceFactory: {
      readonly contractName: "AlbumServiceFactory";
      readonly registrationKey: "albumServiceFactory";
    };
  };
};

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
    ioc_routes_apiRouter,
    ioc_routes_authRouter,
    ioc_routes_mediaRouter,
    ioc_server,
    ioc_services_authService,
  ] as const satisfies readonly IocModuleNamespace[],

  contracts: {
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
        discoveredBy: "naming",
        configOverridesApplied: ["lifetime"],
        dependencyContractNames: ["Knex"],
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
        discoveredBy: "naming",
        dependencyContractNames: ["Knex"],
      },
    },
    AlbumServiceFactory: {
      albumServiceFactory: {
        exportName: "buildAlbumServiceFactory",
        registrationKey: "albumServiceFactory",
        modulePath:
          "application/readServices/viewerReadServices/albumService.ts",
        relImport:
          "../../application/readServices/viewerReadServices/albumService.js",
        contractName: "AlbumServiceFactory",
        implementationName: "albumServiceFactory",
        lifetime: "scoped",
        moduleIndex: 0,
        default: true,
        discoveredBy: "naming",
        configOverridesApplied: ["lifetime"],
        dependencyContractNames: [
          "AlbumReadRepository",
          "MediaItemReadRepository",
        ],
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
        moduleIndex: 2,
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["AuthService", "Logger"],
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
        discoveredBy: "naming",
        dependencyContractNames: ["AuthService", "Logger"],
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
        default: true,
        discoveredBy: "naming",
        configOverridesApplied: ["default"],
        dependencyContractNames: ["AuthService"],
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
        moduleIndex: 26,
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["Config", "Knex", "Logger"],
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
        discoveredBy: "naming",
        dependencyContractNames: ["Knex"],
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
        moduleIndex: 1,
        default: true,
        discoveredBy: "naming",
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
        discoveredBy: "naming",
        dependencyContractNames: ["Logger"],
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
        discoveredBy: "naming",
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
        discoveredBy: "naming",
        dependencyContractNames: ["YogaApp"],
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
        discoveredBy: "naming",
        configOverridesApplied: ["accessKey"],
        dependencyContractNames: ["KnexConfig"],
        accessKey: "database",
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
        discoveredBy: "naming",
        dependencyContractNames: ["Config"],
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
        discoveredBy: "naming",
        dependencyContractNames: [
          "AuthMiddleware",
          "Config",
          "ErrorHandler",
          "GraphQLServer",
          "Knex",
          "Logger",
          "RequestLogger",
          "RootRouter",
        ],
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
        discoveredBy: "naming",
        dependencyContractNames: ["Config"],
      },
    },
    MediaController: {
      mediaController: {
        exportName: "buildMediaController",
        registrationKey: "mediaController",
        modulePath: "controllers/mediaController.ts",
        relImport: "../../controllers/mediaController.js",
        contractName: "MediaController",
        implementationName: "mediaController",
        lifetime: "singleton",
        moduleIndex: 3,
        default: true,
        discoveredBy: "naming",
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
        discoveredBy: "naming",
        configOverridesApplied: ["lifetime"],
        dependencyContractNames: ["Knex"],
      },
    },
    MediaItemRepository: {
      mediaItemRepository: {
        exportName: "buildMediaItemRepository",
        registrationKey: "mediaItemRepository",
        modulePath: "repositories/domainRepositories/mediaItemRepository.ts",
        relImport:
          "../../repositories/domainRepositories/mediaItemRepository.js",
        contractName: "MediaItemRepository",
        implementationName: "mediaItemRepository",
        lifetime: "singleton",
        moduleIndex: 16,
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["Knex"],
      },
    },
    MediaStorage: {
      localMediaStorage: {
        exportName: "buildLocalMediaStorage",
        registrationKey: "localMediaStorage",
        modulePath: "infrastructure/media/localMediaStorage.ts",
        relImport: "../../infrastructure/media/localMediaStorage.js",
        contractName: "MediaStorage",
        implementationName: "localMediaStorage",
        lifetime: "singleton",
        moduleIndex: 6,
        default: true,
        discoveredBy: "naming",
        configOverridesApplied: ["default"],
        dependencyContractNames: ["Config"],
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
        discoveredBy: "naming",
        dependencyContractNames: ["Knex"],
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
        discoveredBy: "naming",
        dependencyContractNames: ["Logger"],
      },
    },
    RootRouter: {
      apiRoutes: {
        exportName: "buildApiRoutes",
        registrationKey: "apiRoutes",
        modulePath: "routes/apiRouter.ts",
        relImport: "../../routes/apiRouter.js",
        contractName: "RootRouter",
        implementationName: "apiRoutes",
        lifetime: "singleton",
        moduleIndex: 22,
        default: true,
        discoveredBy: "naming",
      },
    },
    Router: {
      mediaRouter: {
        exportName: "buildMediaRouter",
        registrationKey: "mediaRouter",
        modulePath: "routes/mediaRouter.ts",
        relImport: "../../routes/mediaRouter.js",
        contractName: "Router",
        implementationName: "mediaRouter",
        lifetime: "singleton",
        moduleIndex: 24,
        discoveredBy: "naming",
        dependencyContractNames: ["MediaController"],
      },
      router: {
        exportName: "buildRouter",
        registrationKey: "router",
        modulePath: "routes/authRouter.ts",
        relImport: "../../routes/authRouter.js",
        contractName: "Router",
        implementationName: "router",
        lifetime: "singleton",
        moduleIndex: 23,
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["AuthController"],
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
        moduleIndex: 25,
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["Config", "KoaServer", "Logger"],
      },
    },
    ShareLinkRepository: {
      shareLinkRepository: {
        exportName: "buildShareLinkRepository",
        registrationKey: "shareLinkRepository",
        modulePath: "repositories/domainRepositories/shareLinkRepository.ts",
        relImport:
          "../../repositories/domainRepositories/shareLinkRepository.js",
        contractName: "ShareLinkRepository",
        implementationName: "shareLinkRepository",
        lifetime: "singleton",
        moduleIndex: 18,
        default: true,
        discoveredBy: "naming",
        dependencyContractNames: ["Knex"],
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
        discoveredBy: "naming",
        dependencyContractNames: ["Knex"],
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
        discoveredBy: "naming",
        dependencyContractNames: ["GraphQLContextFactory"],
      },
    },
  },
  // readServiceFactories
  readServiceFactories: {
    albumServiceFactory: {
      contractName: "AlbumServiceFactory",
      registrationKey: "albumServiceFactory",
    },
  },
} as const satisfies IocGeneratedContainerManifest<IocManifestGroupRoots>;
