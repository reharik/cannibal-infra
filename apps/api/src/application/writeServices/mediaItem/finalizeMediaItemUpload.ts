import { AppErrorCollection, MediaAssetKind } from '@packages/contracts';
import { IocGeneratedCradle } from 'apps/api/src/di/generated/ioc-registry.types';
import { fail, ok } from 'apps/api/src/domain/utilities/writeResponse';
import { WriteResult } from 'apps/api/src/types/types';
import { buildMediaAssetStorageKey } from '../../media/MediaStorage';
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
  mediaAssetRepository,
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
    const uploadAsset = await mediaAssetRepository.getFirstByMediaItemId(mediaItemId);
    if (!uploadAsset) {
      return fail(AppErrorCollection.mediaItem.MediaBytesNotFound);
    }
    const originalAssetStorageKey = buildMediaAssetStorageKey(
      mediaItem.storageKey(),
      MediaAssetKind.original,
    );
    const objectMetadata = await mediaStorage.getObjectMetadata(originalAssetStorageKey);
    if (!objectMetadata) {
      return fail(AppErrorCollection.mediaItem.MediaBytesNotFound);
    }

    uploadAsset.applyUploadedObjectMetadata(
      {
        sizeBytes: objectMetadata.size,
        mimeType: objectMetadata.mimeType,
      },
      viewerId,
    );

    const finalized = mediaItem.completeUploadedWithMetadata(
      {
        sizeBytes: objectMetadata.size,
        mimeType: objectMetadata.mimeType,
      },
      viewerId,
    );
    if (!finalized.success) {
      return finalized;
    }
    await mediaAssetRepository.save(uploadAsset);
    await mediaItemRepository.save(mediaItem);

    return ok({
      mediaItemId: mediaItem.id(),
      status: mediaItem.status(),
      mimeType: objectMetadata.mimeType ?? mediaItem.mimeType(),
      size: objectMetadata.size,
      kind: mediaItem.kind(),
    });
  };
};
