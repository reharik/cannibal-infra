import Router from "@koa/router";
import type { IocGeneratedCradle } from "../di/generated/ioc-registry.types";

export type RootRouter = Router;
const mountRouter = (parent: Router, child: Router) => {
  parent.use(child.routes());
  parent.use(child.allowedMethods());
};

export const buildApiRoutes = ({ routers }: IocGeneratedCradle): RootRouter => {
  const router = new Router({ prefix: "/api" });
  routers.forEach((route) => {
    mountRouter(router, route);
  });

  return router;
};
