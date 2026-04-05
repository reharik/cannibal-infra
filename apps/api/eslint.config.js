import { createBaseTypeScriptConfig } from '../../infra/config/eslint/eslint-shared.js';

const baseConfig = await createBaseTypeScriptConfig({
  tsconfigRootDir: import.meta.dirname,
  ignores: ['**/db/**', '**/generated/**'],
});

/** GraphQL codegen output: must be parseable so resolver imports resolve for type-aware rules. */
const generatedGraphqlTypes = {
  files: ['**/graphql/generated/**/*.ts'],
  rules: {
    'prettier/prettier': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
};

export default [...baseConfig, generatedGraphqlTypes];
