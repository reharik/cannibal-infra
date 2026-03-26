import Router from "@koa/router";
import { koaBody } from "koa-body";
import { buildMediaController } from "../controllers/mediaController";

export type MediaRoutes = Router;

export const buildMediaRoutes = (): MediaRoutes => {
  const router = new Router({ prefix: "/media" });
  const mediaController = buildMediaController();

  router.put(
    "/:userId/:mediaType/:mediaId",
    koaBody({ multipart: true }),
    mediaController.upload,
  );

  return router;
};
