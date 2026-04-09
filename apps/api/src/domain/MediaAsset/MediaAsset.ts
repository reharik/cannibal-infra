/**
 * MediaAsset: a stored file (source or derivative) for a MediaItem.
 */

import { MediaAssetKind, MediaAssetStatus } from '@packages/contracts';
import type { ActorId, EntityId } from '../../types/types';
import { Entity, type EntityAuditRecord } from '../Entity';

export type MediaAssetProps = {
  mediaItemId: EntityId;
  kind: MediaAssetKind;
  mimeType: string;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
  status: MediaAssetStatus;
};

export type MediaAssetRecord = {
  id: EntityId;
  mediaItemId: EntityId;
  kind: MediaAssetKind;
  mimeType: string;
  width?: number;
  height?: number;
  fileSizeBytes?: number;
  status: MediaAssetStatus;
} & EntityAuditRecord;

export type CreateMediaAssetInput = {
  mediaItemId: EntityId;
  kind: MediaAssetKind;
  mimeType: string;
};

export class MediaAsset extends Entity<MediaAssetRecord> {
  protected props: MediaAssetProps;

  private constructor(id: EntityId, actorId: ActorId, props: MediaAssetProps) {
    super(id, actorId);
    this.props = props;
  }

  static create(input: CreateMediaAssetInput, actorId: ActorId): MediaAsset {
    return new MediaAsset(crypto.randomUUID(), actorId, {
      mediaItemId: input.mediaItemId,
      kind: input.kind,
      mimeType: input.mimeType,
      status: MediaAssetStatus.pending,
    });
  }

  static rehydrate(record: MediaAssetRecord): MediaAsset {
    const asset = new MediaAsset(record.id, record.createdBy, {
      mediaItemId: record.mediaItemId,
      kind: record.kind,
      mimeType: record.mimeType,
      width: record.width,
      height: record.height,
      fileSizeBytes: record.fileSizeBytes,
      status: record.status,
    });
    asset.rehydrateAudit(record);
    return asset;
  }

  mediaItemId(): EntityId {
    return this.props.mediaItemId;
  }

  status(): MediaAssetStatus {
    return this.props.status;
  }

  kind(): MediaAssetKind {
    return this.props.kind;
  }

  mimeType(): string {
    return this.props.mimeType;
  }

  applyUploadedObjectMetadata(
    input: { sizeBytes: number; mimeType?: string },
    actorId: ActorId,
  ): void {
    this.props.fileSizeBytes = input.sizeBytes;
    if (input.mimeType !== undefined && input.mimeType.length > 0) {
      this.props.mimeType = input.mimeType;
    }
    this.props.status = MediaAssetStatus.ready;
    this.touch(actorId);
  }
}
