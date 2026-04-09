import { MediaAssetKind } from '@packages/contracts';
import { ok } from 'apps/api/src/domain/utilities/writeResponse';
import { buildMediaAssetStorageKey } from '../../media/MediaStorage';
import { IocGeneratedCradle } from '../../../di/generated/ioc-registry.types';
import { MediaAsset } from '../../../domain/MediaAsset/MediaAsset';
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

    const initialAsset = MediaAsset.create(
      {
        mediaItemId: mediaItem.id(),
        kind: MediaAssetKind.original,
        mimeType,
      },
      viewerId,
    );

    const uploadTarget = await mediaStorage.getUploadTarget({
      mediaItemId: mediaItem.id(),
      storageKey: buildMediaAssetStorageKey(mediaItem.storageKey(), MediaAssetKind.original),
      mimeType,
    });

    await mediaItemRepository.saveNewWithInitialAsset(mediaItem, initialAsset);

    return ok({
      mediaItemId: mediaItem.id(),
      status: mediaItem.status(),
      uploadTarget,
    });
  };
};
