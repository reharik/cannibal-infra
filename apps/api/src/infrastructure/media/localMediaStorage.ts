import { RESOLVER } from "awilix";
import {
  MediaStorage,
  UploadTarget,
} from "../../application/media/MediaStorage";
import { Container } from "../../container";

export const buildLocalMediaStorage = ({ config }: Container): MediaStorage => {
  return {
    getUploadTarget: (input: {
      storageKey: string;
      mimeType: string;
    }): Promise<UploadTarget> => {
      return Promise.resolve({
        url: `${config.serverUrl}/media/${input.storageKey}`,
        method: "PUT",
        headers: {},
      });
    },

    getObjectMetadata: async (
      storageKey: string,
    ): Promise<{ size: number; mimeType?: string | undefined }> => {
      throw new Error("Not implemented");
    },
  };
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
(buildLocalMediaStorage as any)[RESOLVER] = {
  name: "mediaStorage",
};
