import Router from "@koa/router";
import type { IocGeneratedCradle } from "../di/generated/ioc-registry.types";
import { createMediaRoutes } from "./mediaRoutes";

export interface Routes {
  mountRoutes: (router: Router) => void;
}

export const buildRoutes = ({ authRoutes }: IocGeneratedCradle): Routes => ({
  mountRoutes: (router: Router) => {
    const mediaRoutes = createMediaRoutes();

    // Auth routes are a Router instance, use them directly
    router.use(authRoutes.routes());
    router.use(authRoutes.allowedMethods());
    router.use(mediaRoutes.routes());
    router.use(mediaRoutes.allowedMethods());
  },
});
