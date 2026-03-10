import Router from "@koa/router";
import { RESOLVER } from "awilix";
import type { Container } from "../container";

export interface Routes {
  mountRoutes: (router: Router) => void;
}

export const createRoutes = ({ authRoutes }: Container): Routes => ({
  mountRoutes: (router: Router) => {
    // Auth routes are a Router instance, use them directly
    router.use(authRoutes.routes());
    router.use(authRoutes.allowedMethods());
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(createRoutes as any)[RESOLVER] = {};
