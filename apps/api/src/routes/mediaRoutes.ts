import Router from "@koa/router";
import { koaBody } from "koa-body";
import { createMediaController } from "../controllers/mediaController";

export type MediaRoutes = Router;

export const createMediaRoutes = (): MediaRoutes => {
  const router = new Router({ prefix: "/media" });
  const mediaController = createMediaController();

  router.put(
    "/:userId/:mediaType/:mediaId",
    koaBody({ multipart: true }),
    mediaController.upload,
  );

  return router;
};
