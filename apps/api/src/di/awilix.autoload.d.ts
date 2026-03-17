/* AUTO-GENERATED. DO NOT EDIT.
Re-run `npm run gen:container` after adding/removing services.
*/
type AuthService = import("../services/authService").AuthService;

type AuthController = import("../controllers/authController").AuthController;

type AuthMiddleware = import("../middleware/authMiddleware").AuthMiddleware;

type OptionalAuthMiddleware =
  import("../middleware/authMiddleware").OptionalAuthMiddleware;

type RequestLoggerType =
  (typeof import("../middleware/requestLogger"))["createRequestLogger"];
type RequestLogger = RequestLoggerType extends new (
  ...args: unknown[]
) => infer I
  ? I
  : RequestLoggerType extends (...args: unknown[]) => infer R
    ? R
    : RequestLoggerType extends { (...args: unknown[]): infer C }
      ? C
      : unknown;

type AuthRoutesType =
  (typeof import("../routes/authRoutes"))["createAuthRoutes"];
type AuthRoutes = AuthRoutesType extends new (...args: unknown[]) => infer I
  ? I
  : AuthRoutesType extends (...args: unknown[]) => infer R
    ? R
    : AuthRoutesType extends { (...args: unknown[]): infer C }
      ? C
      : unknown;

type Routes = import("../routes/createRoutes").Routes;

export interface AutoLoadedContainer {
  authService: AuthService;
  authController: AuthController;
  authMiddleware: AuthMiddleware;
  optionalAuthMiddleware: OptionalAuthMiddleware;
  requestLogger: RequestLogger;
  authRoutes: AuthRoutes;
  routes: Routes;
}
