import { TEST_VIEWER_1_ID } from './testViewerIds';

export const createMockGraphQLContext = (overrides: Record<string, unknown> = {}) => ({
  state: {
    isLoggedIn: false,
    user: overrides.isLoggedIn
      ? {
          id: TEST_VIEWER_1_ID,
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@example.com',
        }
      : undefined,
    ...overrides,
  },
});
