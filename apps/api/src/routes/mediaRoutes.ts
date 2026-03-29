import Router from "@koa/router";
import { koaBody } from "koa-body";
import { IocGeneratedCradle } from "../di/generated/ioc-registry.types";

export type MediaRoutes = Router;

export const buildMediaRoutes = ({
  mediaController,
}: IocGeneratedCradle): MediaRoutes => {
  const router = new Router({ prefix: "/media" });

  router.put(
    "/:userId/:mediaType/:mediaId",
    koaBody({ multipart: true }),
    mediaController.upload,
  );

  return router;
};
