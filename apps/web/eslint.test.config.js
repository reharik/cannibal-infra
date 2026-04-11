import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import { createRepoTestEslintConfig } from '../../eslint.repo.config.js';

export default await createRepoTestEslintConfig({
  tsconfigRootDir: import.meta.dirname,
  ignores: ['**/generated/**', '**/*.generated.*'],
  globals: globals.browser,
  ecmaVersion: 2020,
  files: [
    '**/*.tests.ts',
    '**/*.tests.tsx',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/src/tests/**/*.ts',
    '**/src/tests/**/*.tsx',
  ],
  additionalPlugins: {
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
  },
  additionalRules: {
    ...reactHooks.configs.recommended.rules,
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
});
