import type { AlbumErrorEnum, MediaItemErrorEnum } from "@packages/contracts";

export type EntityId = string;
export type ActorId = string;

export type DomainWriteError = AlbumErrorEnum | MediaItemErrorEnum;

export type WriteResult =
  | { success: true }
  | { success: false; error: DomainWriteError };

export type StripFactory<T> = {
  [K in keyof T as K extends `${infer Name}Factory`
    ? Name
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      never]: T[K] extends (...args: any[]) => infer R ? R : never;
};
