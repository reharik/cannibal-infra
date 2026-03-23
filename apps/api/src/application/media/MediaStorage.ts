export type UploadTarget = {
  method: "PUT";
  url: string;
  headers?: Record<string, string>;
};

export interface MediaStorage {
  getUploadTarget(input: {
    storageKey: string;
    mimeType: string;
  }): Promise<UploadTarget>;

  getObjectMetadata(storageKey: string): Promise<{
    size: number;
    mimeType?: string;
  }>;
}
