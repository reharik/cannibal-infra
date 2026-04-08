import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { ContractError, ErrorCategory, FrontendError } from '@packages/contracts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const contractError = ContractError.values();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const category = ErrorCategory.values();

type Category = (typeof category)[number];
export type Source = 'backend' | 'frontend' | 'system';

export type ContractErrorPayload = {
  code: string;
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

export type MutationPayload<T> = {
  data?: T | null;
  errors?: ContractErrorPayload[] | null;
};

export type AppResult<T> = { success: true; data: T } | { success: false; errors: AppError[] };

export const ok = <T>(data: T): AppResult<T> => ({
  success: true,
  data,
});

export const fail = (errors: AppError[]): AppResult<never> => ({
  success: false,
  errors,
});

export type ExecuteMutationArgs<TPayload, TVariables> = {
  mutation: TypedDocumentNode<TPayload, TVariables>;
  variables: TVariables;
};
