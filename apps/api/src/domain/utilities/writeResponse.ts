import { DomainWriteError, WriteResult } from "../../types/types";

export const ok = (): WriteResult => ({ success: true });

export const fail = (error: DomainWriteError): WriteResult => ({
  success: false,
  error,
});
