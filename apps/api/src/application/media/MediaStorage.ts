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

export interface MediaStorage {
  getUploadTarget(input: UploadTargetRequest): Promise<UploadTarget>;
  writeObject(input: { storageKey: string; body: Readable; mimeType?: string }): Promise<void>;
  getObjectMetadata(storageKey: string): Promise<{ size: number; mimeType?: string } | null>;
  verifyExistence(storageKey: string): Promise<boolean>;
}
