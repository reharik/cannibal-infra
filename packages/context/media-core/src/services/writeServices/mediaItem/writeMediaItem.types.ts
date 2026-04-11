import { MediaItemStatus, MediaKind } from '@packages/contracts';
import { UploadTarget } from '../../../application/media/MediaStorage';
import { EntityId } from '../../../types/types';

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
  originalFileName?: string;
};

export type CreateMediaUploadResult = {
  mediaItemId: EntityId;
  status: MediaItemStatus;
  uploadTarget: UploadTarget;
};
