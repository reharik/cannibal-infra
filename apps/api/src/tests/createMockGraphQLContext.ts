export const createMockGraphQLContext = (
  overrides: Record<string, unknown> = {},
) => ({
  ctx: {
    isLoggedIn: false,
    ...overrides,
  },
});
