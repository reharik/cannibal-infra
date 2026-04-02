import { MediaStorage, UploadTarget } from '../../application/media/MediaStorage';
import { IocGeneratedCradle } from '../../di/generated/ioc-registry.types';

export const buildLocalMediaStorage = ({ config }: IocGeneratedCradle): MediaStorage => ({
  getUploadTarget: (input: { storageKey: string; mimeType: string }): Promise<UploadTarget> => {
    return Promise.resolve({
      url: `${config.serverUrl}/media/${input.storageKey}`,
      method: 'PUT',
      headers: {},
    });
  },

  getObjectMetadata: async () // storageKey: string,
  : Promise<{ size: number; mimeType?: string | undefined }> => {
    throw new Error('Not implemented');
  },

  verifyExistence: async () // storageKey: string
  : Promise<boolean> => {
    throw new Error('Not implemented');
  },
});
