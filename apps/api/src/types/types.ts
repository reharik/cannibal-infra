import type { AlbumErrorEnum } from "@packages/contracts";

export type EntityId = string;
export type ActorId = string;

export type DomainWriteError = AlbumErrorEnum;

export type WriteResult =
  | { success: true }
  | { success: false; error: DomainWriteError };
