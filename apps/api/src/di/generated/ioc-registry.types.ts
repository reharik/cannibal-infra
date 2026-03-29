/* AUTO-GENERATED. DO NOT EDIT.
Re-run `npm run gen:manifest` after changing factories or IoC config.
*/
import type Router from "../../../../../node_modules/@types/koa__router/index.d.js";
import type { Knex } from "../../../../../node_modules/knex/types/index.d.js";
import type { MediaStorage } from "../../application/media/MediaStorage.js";
import type { AlbumService } from "../../application/readServices/viewerReadServices/albumService.js";
import type { Config } from "../../config.js";
import type { AuthController } from "../../controllers/authController.js";
import type { MediaController } from "../../controllers/mediaController.js";
import type { GraphQLContextFactory } from "../../graphql/context/createGraphQLContext.js";
import type {
  GraphQLServer,
  YogaApp,
} from "../../graphql/server/createGraphQLServer.js";
import type { KnexConfig } from "../../knexfile.js";
import type { KoaServer } from "../../koaServer.js";
import type { Logger } from "../../logger.js";
import type { AuthMiddleware } from "../../middleware/authMiddleware.js";
import type { ErrorHandler } from "../../middleware/errorHandler.js";
import type { RequestLogger } from "../../middleware/requestLogger.js";
import type { AlbumRepository } from "../../repositories/domainRepositories/albumRepository.js";
import type { CommentRepository } from "../../repositories/domainRepositories/commentRepository.js";
import type { MediaItemRepository } from "../../repositories/domainRepositories/mediaItemRepository.js";
import type { NotificationRepository } from "../../repositories/domainRepositories/notificationRepository.js";
import type { ShareLinkRepository } from "../../repositories/domainRepositories/shareLinkRepository.js";
import type { UserRepository } from "../../repositories/domainRepositories/userRepository.js";
import type { AlbumReadRepository } from "../../repositories/readRepositories/albumReadRepository.js";
import type { MediaItemReadRepository } from "../../repositories/readRepositories/mediaItemReadRepository.js";
import type { AuthRoutes } from "../../routes/authRoutes.js";
import type { MediaRoutes } from "../../routes/mediaRoutes.js";
import type { Server } from "../../server.js";
import type { AuthService } from "../../services/authService.js";

export interface IocGeneratedTypes {
  albumReadRepository: AlbumReadRepository;
  albumRepository: AlbumRepository;
  albumService: AlbumService;
  authController: AuthController;
  authMiddleware: AuthMiddleware;
  optionalAuthMiddleware: AuthMiddleware;
  authMiddlewares: Record<
    "authMiddleware" | "optionalAuthMiddleware",
    AuthMiddleware
  >;
  authRoutes: AuthRoutes;
  authService: AuthService;
  commentRepository: CommentRepository;
  config: Config;
  errorHandler: ErrorHandler;
  graphQLContextFactory: GraphQLContextFactory;
  graphQLContext: GraphQLContextFactory;
  graphQLServer: GraphQLServer;
  knex: Knex;
  database: Knex;
  knexConfig: KnexConfig;
  koaServer: KoaServer;
  logger: Logger;
  mediaController: MediaController;
  mediaItemReadRepository: MediaItemReadRepository;
  mediaItemRepository: MediaItemRepository;
  mediaRoutes: MediaRoutes;
  mediaStorage: MediaStorage;
  notificationRepository: NotificationRepository;
  requestLogger: RequestLogger;
  router: Router;
  apiRoutes: Router;
  server: Server;
  shareLinkRepository: ShareLinkRepository;
  userRepository: UserRepository;
  yogaApp: YogaApp;
  readServices: ReadonlyArray<AlbumService>;
  routes: ReadonlyArray<AuthRoutes | MediaRoutes>;
}

export type IocGeneratedCradle = IocGeneratedTypes;
