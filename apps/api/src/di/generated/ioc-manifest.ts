/* AUTO-GENERATED. DO NOT EDIT.
Re-run `npm run gen:container` after adding/removing resolver-tagged modules.
*/

import type { IocManifest } from "../ioc-manifest-types";
import * as module1 from "../../application/readServices/readService";
import * as module2 from "../../application/readServices/viewerReadServices/albumService";
import * as module3 from "../../controllers/authController";
import * as module4 from "../../graphql/context/createGraphQLContext";
import * as module5 from "../../graphql/server/createGraphQLServer";
import * as module6 from "../../koaServer";
import * as module7 from "../../middleware/authMiddleware";
import * as module8 from "../../middleware/errorHandler";
import * as module9 from "../../middleware/requestLogger";
import * as module10 from "../../repositories/domainRepositories/albumRepository";
import * as module11 from "../../repositories/domainRepositories/commentRepository";
import * as module12 from "../../repositories/domainRepositories/mediaItemRepository";
import * as module13 from "../../repositories/domainRepositories/notificationRepository";
import * as module14 from "../../repositories/domainRepositories/shareLinkRepository";
import * as module15 from "../../repositories/domainRepositories/userRepository";
import * as module16 from "../../repositories/readRepositories/albumReadRepository";
import * as module17 from "../../repositories/readRepositories/mediaItemReadRepository";
import * as module18 from "../../routes/authRoutes";
import * as module19 from "../../routes/createRoutes";
import * as module20 from "../../services/authService";

export const iocManifest: IocManifest = [
  {
    modulePath: "application/readServices/readService.ts",
    exports: module1,
  },
  {
    modulePath: "application/readServices/viewerReadServices/albumService.ts",
    exports: module2,
  },
  {
    modulePath: "controllers/authController.ts",
    exports: module3,
  },
  {
    modulePath: "graphql/context/createGraphQLContext.ts",
    exports: module4,
  },
  {
    modulePath: "graphql/server/createGraphQLServer.ts",
    exports: module5,
  },
  {
    modulePath: "koaServer.ts",
    exports: module6,
  },
  {
    modulePath: "middleware/authMiddleware.ts",
    exports: module7,
  },
  {
    modulePath: "middleware/errorHandler.ts",
    exports: module8,
  },
  {
    modulePath: "middleware/requestLogger.ts",
    exports: module9,
  },
  {
    modulePath: "repositories/domainRepositories/albumRepository.ts",
    exports: module10,
  },
  {
    modulePath: "repositories/domainRepositories/commentRepository.ts",
    exports: module11,
  },
  {
    modulePath: "repositories/domainRepositories/mediaItemRepository.ts",
    exports: module12,
  },
  {
    modulePath: "repositories/domainRepositories/notificationRepository.ts",
    exports: module13,
  },
  {
    modulePath: "repositories/domainRepositories/shareLinkRepository.ts",
    exports: module14,
  },
  {
    modulePath: "repositories/domainRepositories/userRepository.ts",
    exports: module15,
  },
  {
    modulePath: "repositories/readRepositories/albumReadRepository.ts",
    exports: module16,
  },
  {
    modulePath: "repositories/readRepositories/mediaItemReadRepository.ts",
    exports: module17,
  },
  {
    modulePath: "routes/authRoutes.ts",
    exports: module18,
  },
  {
    modulePath: "routes/createRoutes.ts",
    exports: module19,
  },
  {
    modulePath: "services/authService.ts",
    exports: module20,
  },
];
