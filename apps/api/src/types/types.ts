import type { AlbumErrorEnum, MediaItemErrorEnum } from '@packages/contracts';

export type EntityId = string;
export type ActorId = string;

export type DomainWriteError = AlbumErrorEnum | MediaItemErrorEnum;

export type StripFactory<T> = {
  [K in keyof T as K extends `${infer Name}Factory`
    ? Name
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      never]: T[K] extends (...args: any[]) => infer R ? R : never;
};

/**
 * WriteResult<T, E>
 *
 * Standard result type for write operations (command side).
 *
 * PATTERN
 * -------
 * We use WriteResult to model *expected business/domain failures* as data,
 * instead of throwing exceptions.
 *
 * - success → ok(value)
 * - failure → fail(error)
 *
 * WHERE IT IS USED
 * ----------------
 * - Returned from write services (always)
 * - Returned from Aggregate Root / domain methods when enforcing invariants
 *
 * WHERE IT IS NOT USED
 * --------------------
 * - Repositories: return plain values (e.g. Entity | null)
 * - Pure helpers/utilities: return plain values
 * - Infrastructure (DB, HTTP, etc): throw on failure
 *
 * ERROR HANDLING RULE
 * -------------------
 * - Expected domain/business failure → return fail(error)
 *   (e.g. invalid state, invariant violation, not allowed)
 *
 * - Unexpected/system failure → throw
 *   (e.g. DB down, network failure, programmer error)
 *
 * FLOW
 * ----
 * resolver → write service → domain (AR) → repo
 *
 * - Domain + service layers may propagate WriteResult
 * - Resolver is the boundary that converts WriteResult → API response
 *
 * GOAL
 * ----
 * Keep business failures explicit and type-safe,
 * while avoiding excessive Result plumbing in non-domain layers.
 */

export type WriteResult<T = void, E = DomainWriteError> =
  | { success: true; value: T }
  | { success: false; error: E };
