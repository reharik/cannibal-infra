export default {
  displayName: 'api',
  preset: '../../infra/config/jest/jest.preset.cjs',
  testEnvironment: 'node',
  /**
   * One worker only: integration tests share a real Postgres DB and a singleton IoC container.
   * Parallel test files will race on TRUNCATE/inserts and produce flaky (3–6 random) failures.
   */
  maxWorkers: 1,
  /** Integration tests leave the Knex pool and sometimes an HTTP server open; exit cleanly. */
  forceExit: true,
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(ts|tsx|js|mjs)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'mjs'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^./knexfile$': '<rootDir>/src/tests/__mocks__/knexfile.js',
  },
  coverageDirectory: '<rootDir>/coverage',
  globalTeardown: '<rootDir>/src/tests/jestGlobalTeardown.ts',
  setupFiles: ['<rootDir>/src/tests/setup.ts'],
  testMatch: ['**/tests/**/*.tests.ts', '**/?(*.)+(spec|test).?([mc])[jt]s?(x)'],
  transformIgnorePatterns: [
    'node_modules/(?!(@reharik/smart-enum|@reharik/smart-enum-knex|case-anything|@network|koa|@koa|only|http-errors|statuses|graphql-yoga|@graphql-tools)/)',
  ],
};
