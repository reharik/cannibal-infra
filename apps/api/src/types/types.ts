import type { AlbumErrorEnum, MediaItemErrorEnum } from "@packages/contracts";

export type EntityId = string;
export type ActorId = string;

export type DomainWriteError = AlbumErrorEnum | MediaItemErrorEnum;

export type WriteResult =
  | { success: true }
  | { success: false; error: DomainWriteError };
