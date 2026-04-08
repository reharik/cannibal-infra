import { MediaItemStatus, MediaKind } from '@packages/contracts';
import { EntityId } from 'apps/api/src/types/types';
import { UploadTarget } from '../../media/MediaStorage';

export type FinalizeMediaItemUploadCommand = {
  viewerId: EntityId;
  mediaItemId: EntityId;
};

export type FinalizeMediaItemUploadResult = {
  mediaItemId: string;
  status: MediaItemStatus;
  mimeType?: string;
  size: number;
  kind: MediaKind;
};

export type CreateMediaUploadCommand = {
  viewerId: string;
  kind: MediaKind;
  mimeType: string;
};

export type CreateMediaUploadResult = {
  mediaItemId: EntityId;
  status: MediaItemStatus;
  uploadTarget: UploadTarget;
};
