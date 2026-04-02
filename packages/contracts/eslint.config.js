import { createBaseTypeScriptConfig } from '../../infra/config/eslint/eslint-shared.js';

export default [
  {
    ignores: ['**/_typia/**', '**/dist/**', '**/graphqlSmartEnums.ts'],
  },
  ...(await createBaseTypeScriptConfig({
    tsconfigRootDir: import.meta.dirname,
  })),
];
