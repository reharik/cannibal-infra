import { MediaItemStatus, MediaKind } from '@packages/contracts';
import { ok } from 'apps/api/src/domain/utilities/writeResponse';
import { IocGeneratedCradle } from '../../../di/generated/ioc-registry.types';
import { MediaItem } from '../../../domain/MediaItem/MediaItem';
import { EntityId, WriteResult } from '../../../types/types';
import { UploadTarget } from '../../media/MediaStorage';
import { WriteServiceBase } from '../writeServiceBaseType';

export type CreateMediaUploadInput = {
  viewerId: string;
  kind: MediaKind;
  mimeType: string;
};

export interface CreateMediaUpload extends WriteServiceBase {
  (input: CreateMediaUploadInput): Promise<WriteResult<CreateMediaUploadResult>>;
}

export type CreateMediaUploadResult = {
  mediaItemId: EntityId;
  status: MediaItemStatus;
  uploadTarget: UploadTarget;
};

export const buildCreateMediaItemUpload = ({
  mediaItemRepository,
  mediaStorage,
}: IocGeneratedCradle): CreateMediaUpload => {
  return async (input: CreateMediaUploadInput): Promise<WriteResult<CreateMediaUploadResult>> => {
    const { viewerId, kind, mimeType } = input;
    const mediaItem = MediaItem.create(
      {
        kind,
        mimeType,
      },
      viewerId,
    );

    const uploadTarget = await mediaStorage.getUploadTarget({
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
