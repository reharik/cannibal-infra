import { DomainWriteError, WriteResult } from '../../types/types';

export const ok = <T, E extends DomainWriteError = DomainWriteError>(
  value: T,
): WriteResult<T, E> => ({ success: true, value });

export const fail = <T = void, E extends DomainWriteError = DomainWriteError>(
  error: E,
): WriteResult<T, E> => ({
  success: false,
  error,
});
