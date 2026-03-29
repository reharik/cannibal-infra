import Router from "@koa/router";
import type { IocGeneratedCradle } from "../di/generated/ioc-registry.types";

const mountRouter = (parent: Router, child: Router) => {
  parent.use(child.routes());
  parent.use(child.allowedMethods());
};

export const buildApiRoutes = ({ routes }: IocGeneratedCradle): Router => {
  const router = new Router({ prefix: "/api" });
  routes.forEach((route) => {
    mountRouter(router, route);
  });

  return router;
};
