import { MediaAssetKind } from '@packages/contracts';
import type { Readable } from 'node:stream';

export type UploadTarget = {
  method: 'PUT';
  url: string;
  headers?: Record<string, string>;
};

type UploadTargetRequest = {
  mediaItemId: string;
  storageKey: string;
  mimeType: string;
};

const normalizeAssetKindSegment = (assetKind: MediaAssetKind | string): string => {
  if (typeof assetKind === 'string') {
    return assetKind.toLowerCase();
  }
  return assetKind.key;
};

export const buildMediaAssetStorageKey = (
  baseStorageKey: string,
  assetKind: MediaAssetKind | string,
): string => {
  const normalizedBaseStorageKey = baseStorageKey.endsWith('/')
    ? baseStorageKey.slice(0, -1)
    : baseStorageKey;
  return `${normalizedBaseStorageKey}/${normalizeAssetKindSegment(assetKind)}`;
};

export interface MediaStorage {
  getUploadTarget(input: UploadTargetRequest): Promise<UploadTarget>;
  writeObject(input: { storageKey: string; body: Readable; mimeType?: string }): Promise<void>;
  getObjectMetadata(storageKey: string): Promise<{ size: number; mimeType?: string } | null>;
  verifyExistence(storageKey: string): Promise<boolean>;
  getObjectUrl(storageKey: string): string;
  getObjectStream(storageKey: string): Promise<{ body: Readable; mimeType?: string } | null>;
}
