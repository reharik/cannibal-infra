import { enumeration, type Enumeration } from '@reharik/smart-enum';

const frontendErrorInput = {} as const;
export type FrontendError = Enumeration<typeof FrontendError>;
export const FrontendError = enumeration<typeof frontendErrorInput>('FrontendError', {
  input: frontendErrorInput,
});
