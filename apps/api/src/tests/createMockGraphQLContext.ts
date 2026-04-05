import { TEST_VIEWER_1_ID } from './testViewerIds';

const defaultTestViewerUser = {
  id: TEST_VIEWER_1_ID,
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@example.com',
};

/**
 * Mirrors Koa `ctx.state` for `buildCreateGraphQLContext`. Uses strict `isLoggedIn === true`
 * so only an explicit boolean `true` enables the viewer (avoids truthy surprises).
 */
export const createMockGraphQLContext = (overrides: Record<string, unknown> = {}) => {
  const isLoggedIn = overrides.isLoggedIn === true;
  const userFromOverrides =
    typeof overrides.user === 'object' && overrides.user !== null
      ? (overrides.user as Record<string, string | undefined>)
      : undefined;

  return {
    state: {
      ...overrides,
      isLoggedIn,
      user: isLoggedIn ? { ...defaultTestViewerUser, ...userFromOverrides } : undefined,
    },
  };
};
