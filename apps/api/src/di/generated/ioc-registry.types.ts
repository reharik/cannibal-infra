/* AUTO-GENERATED. DO NOT EDIT.
Re-run `npm run gen:manifest` after changing factories or IoC config.
*/
import type {
  AddAlbumItem,
  AlbumReadRepository,
  AlbumRepository,
  CommentRepository,
  CreateAlbum,
  CreateMediaUpload,
  FinalizeMediaItemUpload,
  MediaAssetReadRepository,
  MediaAssetRepository,
  MediaItemReadRepository,
  MediaItemRepository,
  MediaStorage,
  NotificationRepository,
  ShareLinkRepository,
  UserRepository,
  ViewerAlbumReadServiceFactory,
  ViewerMediaItemReadServiceFactory,
} from '@packages/media-core';
import type Router from '../../../../../node_modules/@types/koa__router/index.d.js';
import type { Knex } from '../../../../../node_modules/knex/types/index.d.js';
import type { Config } from '../../config.js';
import type { AuthController } from '../../controllers/authController.js';
import type { GraphQLContextFactory } from '../../graphql/context/types.js';
import type { GraphQLServer, YogaApp } from '../../graphql/server/createGraphQLServer.js';
import type { KnexConfig } from '../../knexfile.js';
import type { KoaServer } from '../../koaServer.js';
import type { Logger } from '../../logger.js';
import type { AuthMiddleware } from '../../middleware/authMiddleware.js';
import type { ErrorHandler } from '../../middleware/errorHandler.js';
import type { RequestLogger } from '../../middleware/requestLogger.js';
import type { MediaProcessingJobRepository } from '../../repositories/domainRepositories/mediaProcessingJobRepository.js';
import type { RootRouter } from '../../routes/apiRouter.js';
import type { Server } from '../../server.js';
import type { AuthService } from '../../services/authService.js';

export interface IocGeneratedTypes {
  addAlbumItem: AddAlbumItem;
  albumReadRepository: AlbumReadRepository;
  albumRepository: AlbumRepository;
  authController: AuthController;
  authMiddleware: AuthMiddleware;
  authMiddlewares: ReadonlyArray<AuthMiddleware>;
  authService: AuthService;
  commentRepository: CommentRepository;
  config: Config;
  createAlbum: CreateAlbum;
  createMediaUpload: CreateMediaUpload;
  errorHandler: ErrorHandler;
  finalizeMediaItemUpload: FinalizeMediaItemUpload;
  graphQLContextFactory: GraphQLContextFactory;
  graphQLServer: GraphQLServer;
  database: Knex;
  knexConfig: KnexConfig;
  koaServer: KoaServer;
  logger: Logger;
  mediaAssetReadRepository: MediaAssetReadRepository;
  mediaAssetRepository: MediaAssetRepository;
  mediaItemReadRepository: MediaItemReadRepository;
  mediaItemRepository: MediaItemRepository;
  mediaProcessingJobRepository: MediaProcessingJobRepository;
  mediaStorage: MediaStorage;
  notificationRepository: NotificationRepository;
  requestLogger: RequestLogger;
  rootRouter: RootRouter;
  router: Router;
  server: Server;
  shareLinkRepository: ShareLinkRepository;
  userRepository: UserRepository;
  viewerAlbumReadServiceFactory: ViewerAlbumReadServiceFactory;
  viewerMediaItemReadServiceFactory: ViewerMediaItemReadServiceFactory;
  yogaApp: YogaApp;
  readServiceFactories: {
    viewerAlbumReadServiceFactory: ViewerAlbumReadServiceFactory;
    viewerMediaItemReadServiceFactory: ViewerMediaItemReadServiceFactory;
  };
  writeServices: {
    addAlbumItem: AddAlbumItem;
    createAlbum: CreateAlbum;
    createMediaUpload: CreateMediaUpload;
    finalizeMediaItemUpload: FinalizeMediaItemUpload;
  };
}

export type IocGeneratedCradle = IocGeneratedTypes;
