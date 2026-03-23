import Router from "@koa/router";
import { RESOLVER } from "awilix";
import type { Container } from "../container";
import { requireAuth } from "../middleware/routeGuards";

export type AuthRoutes = Router;

export const buildAuthRoutes = ({ authController }: Container): AuthRoutes => {
  const router = new Router({ prefix: "/auth" });

  // Public routes
  router.post("/login", authController.login);
  router.post("/signup", authController.signup);
  router.post("/logout", authController.logout);

  // Protected routes
  router.get("/me", requireAuth(), authController.me);

  return router;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(buildAuthRoutes as any)[RESOLVER] = {};
