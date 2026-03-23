import {
  MediaStorage,
  UploadTarget,
} from "../../application/media/MediaStorage";

export const localMediaStorage: MediaStorage = {
  getUploadTarget: async (input: {
    storageKey: string;
    mimeType: string;
  }): Promise<UploadTarget> => {
    throw new Error("Not implemented");
  },
  getObjectMetadata: async (
    storageKey: string,
  ): Promise<{ size: number; mimeType?: string | undefined }> => {
    throw new Error("Not implemented");
  },
};
