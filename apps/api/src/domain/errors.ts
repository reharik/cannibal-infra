/**
 * Domain errors: failures that represent violated invariants or invalid operations.
 * Framework-agnostic; thrown or returned from domain methods.
 */

export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "DomainError";
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}
