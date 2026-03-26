import Router from "@koa/router";
import { RESOLVER } from "awilix";
import type { Container } from "../container";
import { buildMediaRoutes } from "./mediaRoutes";

export interface Routes {
  mountRoutes: (router: Router) => void;
}

export const buildRoutes = ({ authRoutes }: Container): Routes => ({
  mountRoutes: (router: Router) => {
    const mediaRoutes = buildMediaRoutes();

    // Auth routes are a Router instance, use them directly
    router.use(authRoutes.routes());
    router.use(authRoutes.allowedMethods());
    router.use(mediaRoutes.routes());
    router.use(mediaRoutes.allowedMethods());
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(buildRoutes as any)[RESOLVER] = {};
