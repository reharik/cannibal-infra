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

type WriteUploadedFileInput = {
  storageKey: string;
  sourceFilePath: string;
  mimeType?: string;
};

export interface MediaStorage {
  getUploadTarget(input: UploadTargetRequest): Promise<UploadTarget>;
  writeUploadedFile(input: WriteUploadedFileInput): Promise<void>;
  getObjectMetadata(storageKey: string): Promise<{ size: number; mimeType?: string } | null>;
  verifyExistence(storageKey: string): Promise<boolean>;
}
