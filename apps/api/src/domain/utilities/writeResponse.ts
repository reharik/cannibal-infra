import { DomainWriteError, WriteResult } from '../../types/types';

export const ok = <T>(value: T): WriteResult<T> => ({ success: true, value });

export const fail = <T = void>(error: DomainWriteError): WriteResult<T> => ({
  success: false,
  error,
});
