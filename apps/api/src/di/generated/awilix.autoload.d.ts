/* AUTO-GENERATED. DO NOT EDIT.
Re-run `npm run gen:container` after adding/removing resolver-tagged modules.
*/
type AlbumReadRepository =
  import("../../repositories/readRepositories/albumReadRepository").AlbumReadRepository;

type AlbumRepository =
  import("../../repositories/domainRepositories/albumRepository").AlbumRepository;

type AuthController = import("../../controllers/authController").AuthController;

type AuthMiddleware = import("../../middleware/authMiddleware").AuthMiddleware;

type AuthRoutes = import("../../routes/authRoutes").AuthRoutes;

type AuthService = import("../../services/authService").AuthService;

type BindViewerReadServices =
  import("../../application/readServices/readService").BindViewerReadServices;

type CommentRepository =
  import("../../repositories/domainRepositories/commentRepository").CommentRepository;

type ErrorHandler = import("../../middleware/errorHandler").ErrorHandler;

type GraphQLContext =
  import("../../graphql/context/createGraphQLContext").GraphQLContext;

type GraphQLServer =
  import("../../graphql/server/createGraphQLServer").GraphQLServer;

type KoaServer = import("../../koaServer").KoaServer;

type MediaItemReadRepository =
  import("../../repositories/readRepositories/mediaItemReadRepository").MediaItemReadRepository;

type MediaItemRepository =
  import("../../repositories/domainRepositories/mediaItemRepository").MediaItemRepository;

type NotificationRepository =
  import("../../repositories/domainRepositories/notificationRepository").NotificationRepository;

type OptionalAuthMiddleware =
  import("../../middleware/authMiddleware").OptionalAuthMiddleware;

type RequestLogger = import("../../middleware/requestLogger").RequestLogger;

type Routes = import("../../routes/createRoutes").Routes;

type ShareLinkRepository =
  import("../../repositories/domainRepositories/shareLinkRepository").ShareLinkRepository;

type UserRepository =
  import("../../repositories/domainRepositories/userRepository").UserRepository;

type YogaApp = import("../../graphql/server/createGraphQLServer").YogaApp;

type ReadViewerServices = {
  albumService: import("../../application/readServices/viewerReadServices/albumService").AlbumService;
};

export interface AutoLoadedContainer {
  albumReadRepository: AlbumReadRepository;
  albumRepository: AlbumRepository;
  authController: AuthController;
  authMiddleware: AuthMiddleware;
  authRoutes: AuthRoutes;
  authService: AuthService;
  bindViewerReadServices: BindViewerReadServices;
  commentRepository: CommentRepository;
  errorHandler: ErrorHandler;
  graphQLContext: GraphQLContext;
  graphQLServer: GraphQLServer;
  koaServer: KoaServer;
  mediaItemReadRepository: MediaItemReadRepository;
  mediaItemRepository: MediaItemRepository;
  notificationRepository: NotificationRepository;
  optionalAuthMiddleware: OptionalAuthMiddleware;
  requestLogger: RequestLogger;
  routes: Routes;
  shareLinkRepository: ShareLinkRepository;
  userRepository: UserRepository;
  yogaApp: YogaApp;
  readViewerServices: ReadViewerServices;
}
