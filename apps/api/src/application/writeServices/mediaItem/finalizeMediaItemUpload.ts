import { AppErrorCollection, MediaItemStatus } from '@packages/contracts';
import { IocGeneratedCradle } from 'apps/api/src/di/generated/ioc-registry.types';
import { fail, ok } from 'apps/api/src/domain/utilities/writeResponse';
import { WriteResult } from 'apps/api/src/types/types';
import { WriteServiceBase } from '../writeServiceBaseType';
import {
  FinalizeMediaItemUploadCommand,
  FinalizeMediaItemUploadResult,
} from './writeMediaItem.types';

export interface FinalizeMediaItemUpload extends WriteServiceBase {
  (input: FinalizeMediaItemUploadCommand): Promise<WriteResult<FinalizeMediaItemUploadResult>>;
}

export const buildFinalizeMediaItemUpload = ({
  mediaItemRepository,
  mediaStorage,
}: IocGeneratedCradle): FinalizeMediaItemUpload => {
  return async (
    input: FinalizeMediaItemUploadCommand,
  ): Promise<WriteResult<FinalizeMediaItemUploadResult>> => {
    const { viewerId, mediaItemId } = input;
    const mediaItem = await mediaItemRepository.getById(mediaItemId);
    if (!mediaItem) {
      return fail(AppErrorCollection.mediaItem.MediaItemNotFound);
    }
    if (mediaItem.ownerId() !== viewerId) {
      return fail(AppErrorCollection.mediaItem.MediaItemNotOwnedByViewer);
    }
    const objectMetadata = await mediaStorage.getObjectMetadata(mediaItem.storageKey());
    if (!objectMetadata) {
      return fail(AppErrorCollection.mediaItem.MediaBytesNotFound);
    }
    const finalized = mediaItem.finalizeStatus(MediaItemStatus.ready, viewerId);
    if (!finalized.success) {
      return finalized;
    }
    await mediaItemRepository.save(mediaItem);

    return ok({
      mediaItemId: mediaItem.id(),
      status: mediaItem.status(),
      mimeType: objectMetadata.mimeType,
      size: objectMetadata.size,
      kind: mediaItem.kind(),
    });
  };
};
