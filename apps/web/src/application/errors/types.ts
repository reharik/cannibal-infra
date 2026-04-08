import { ContractError, ErrorCategory, FrontendError } from '@packages/contracts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const contractError = ContractError.values();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const category = ErrorCategory.values();

type Code = (typeof contractError)[number];
type Category = (typeof category)[number];
export type Source = 'backend' | 'frontend' | 'system';

export type ContractErrorPayload = {
  code: Code;
  message?: string;
  field?: string;
};

export type FrontendErrorInput = {
  code: FrontendError;
  field?: string;
  message?: string;
  meta?: Record<string, unknown>;
};

export type AppError = {
  code: string;
  message: string;
  field?: string;
  source: Source;
  category: Category;
  retryable: boolean;
};

export type ErrorDefinition = {
  value: string;
  display: string;
  field?: string;
  retryable?: boolean;
  category: {
    value: Category;
  };
};

export type ErrorInput = {
  message?: string;
  field?: string;
};
