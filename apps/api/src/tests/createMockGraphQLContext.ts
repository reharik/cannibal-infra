export const createMockGraphQLContext = (overrides: Record<string, unknown> = {}) => ({
  state: {
    isLoggedIn: false,
    user: overrides.isLoggedIn
      ? {
          id: 'viewer-1',
          firstName: 'Demo',
          lastName: 'User',
          email: 'demo@example.com',
        }
      : undefined,
    ...overrides,
  },
});
