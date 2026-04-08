import { ok } from 'apps/api/src/domain/utilities/writeResponse';
import { IocGeneratedCradle } from '../../../di/generated/ioc-registry.types';
import { MediaItem } from '../../../domain/MediaItem/MediaItem';
import { WriteResult } from '../../../types/types';
import { WriteServiceBase } from '../writeServiceBaseType';
import { CreateMediaUploadCommand, CreateMediaUploadResult } from './writeMediaItem.types';

export interface CreateMediaUpload extends WriteServiceBase {
  (input: CreateMediaUploadCommand): Promise<WriteResult<CreateMediaUploadResult>>;
}

export const buildCreateMediaItemUpload = ({
  mediaItemRepository,
  mediaStorage,
}: IocGeneratedCradle): CreateMediaUpload => {
  return async (input: CreateMediaUploadCommand): Promise<WriteResult<CreateMediaUploadResult>> => {
    const { viewerId, kind, mimeType } = input;
    const mediaItem = MediaItem.create(
      {
        kind,
        mimeType,
      },
      viewerId,
    );

    const uploadTarget = await mediaStorage.getUploadTarget({
      mediaItemId: mediaItem.id(),
      storageKey: mediaItem.storageKey(),
      mimeType,
    });

    await mediaItemRepository.save(mediaItem);

    return ok({
      mediaItemId: mediaItem.id(),
      status: mediaItem.status(),
      uploadTarget,
    });
  };
};
