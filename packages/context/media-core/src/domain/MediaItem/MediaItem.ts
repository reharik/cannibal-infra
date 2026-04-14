/**
 * MediaItem: uploaded media asset (photo or video) owned by a user (by ID).
 * Encapsulates metadata; can appear in multiple albums via AlbumItem.
 */

import type { MediaAssetKind, ResourceTypeEnum } from '@packages/contracts';
import {
  AppErrorCollection,
  ContractError,
  MediaAssetStatus,
  MediaItemStatus,
  MediaKind,
} from '@packages/contracts';
import type { ActorId, EntityId, WriteResult } from '../../types/types';
import { AggregateRoot } from '../AggregateRoot';
import { Comment, CommentRecord } from '../Comment/Comment';
import type { ChildEntities, EntityAuditRecord } from '../Entity';
import { fail, ok } from '../utilities/writeResponse';
import { MediaAsset, MediaAssetRecord } from './MediaAsset';

interface AssetMetadata {
  kind: MediaAssetKind;
  mimeType?: string;
  sizeBytes: number;
  width?: number;
  height?: number;
}

export type MediaItemProps = {
  ownerId: EntityId;
  storageKey: string;
  kind: MediaKind;
  status: MediaItemStatus;
  mimeType: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  originalFileName?: string;
  title?: string;
  description?: string;
  takenAt?: Date;
};

export type MediaItemRecord = {
  id: EntityId;
  ownerId: EntityId;
  storageKey: string;
  kind: MediaKind;
  status: MediaItemStatus;
  mimeType: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  originalFileName?: string;
  title?: string;
  description?: string;
  takenAt?: Date;
  comments: CommentRecord[];
  assets: MediaAssetRecord[];
} & EntityAuditRecord;

export type CreateMediaItemInput = {
  kind: MediaKind;
  status?: MediaItemStatus;
  mimeType: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  originalFileName?: string;
  title?: string;
  description?: string;
  takenAt?: Date;
};

export class MediaItem extends AggregateRoot<MediaItemRecord> {
  protected props: MediaItemProps;
  #comments: Comment[] = [];
  #assets: MediaAsset[] = [];

  private constructor(id: EntityId, actorId: ActorId, props: MediaItemProps) {
    super(id, actorId);
    this.props = {
      ...props,
    };
    this.props.ownerId = actorId;
  }

  static create(input: CreateMediaItemInput, actorId: ActorId): MediaItem {
    const mediaItemId = crypto.randomUUID();
    const storageKey = `media/${actorId}/${mediaItemId}`;
    return new MediaItem(mediaItemId, actorId, {
      ...input,
      sizeBytes: input.sizeBytes ?? 0,
      status: MediaItemStatus.pending,
      ownerId: actorId,
      storageKey,
    });
  }

  static rehydrate(record: MediaItemRecord): MediaItem {
    const mediaItem = new MediaItem(record.id, record.createdBy, record);

    mediaItem.rehydrateAudit(record);
    mediaItem.#comments = record.comments.map((r) => Comment.rehydrate(r));
    mediaItem.#assets = record.assets.map((r) => MediaAsset.rehydrate(r));
    return mediaItem;
  }

  addComment(
    props: {
      resourceType: ResourceTypeEnum;
      authorId: EntityId;
      content: string;
    },
    actorId: ActorId,
  ): void {
    this.#comments.push(Comment.create(props, actorId));
    this.touch(actorId);
  }

  addAsset(kind: MediaAssetKind, mimeType: string) {
    if (this.#assets.find((a) => a.kind() === kind)) {
      return fail(AppErrorCollection.mediaItem.AssetKindAlreadyExists);
    }

    this.#assets.push(
      MediaAsset.create(
        {
          kind,
          mimeType,
        },
        this.props.ownerId,
      ),
    );
    return ok(undefined);
  }

  updateAssetWithMetadata({ kind, sizeBytes, mimeType, width, height }: AssetMetadata) {
    const asset = this.#assets.find((a) => a.kind() === kind);
    if (!asset) {
      return fail(AppErrorCollection.mediaItem.AssetNotFound);
    }
    if (asset.status() !== MediaAssetStatus.pending) {
      return fail(AppErrorCollection.mediaItem.AssetNotPending);
    }
    asset.applyUploadedObjectMetadata({ sizeBytes, mimeType, width, height }, this.props.ownerId);
    return ok(undefined);
  }

  updateTitle(title: string | undefined, actorId: ActorId): void {
    this.props.title = title;
    this.touch(actorId);
  }

  updateDescription(description: string | undefined, actorId: ActorId): void {
    this.props.description = description;
    this.touch(actorId);
  }

  ownerId(): EntityId {
    return this.props.ownerId;
  }

  status(): MediaItemStatus {
    return this.props.status;
  }

  storageKey(): string {
    return this.props.storageKey;
  }

  kind(): MediaKind {
    return this.props.kind;
  }

  mimeType(): string {
    return this.props.mimeType;
  }

  sizeBytes(): number {
    return this.props.sizeBytes ?? 0;
  }

  width(): number | undefined {
    return this.props.width;
  }

  height(): number | undefined {
    return this.props.height;
  }

  /**
   * After object exists in storage: persist size (and optional mime), pending → uploaded.
   * Used when bytes land via direct upload (e.g. S3) without derivative processing.
   */
  completeUploadedWithMetadata(
    input: { sizeBytes: number; mimeType?: string },
    actorId: ActorId,
  ): WriteResult {
    if (this.props.status !== MediaItemStatus.pending) {
      return fail(AppErrorCollection.mediaItem.StatusNotPending);
    }
    this.props.sizeBytes = input.sizeBytes;
    if (input.mimeType !== undefined && input.mimeType.length > 0) {
      this.props.mimeType = input.mimeType;
    }
    this.props.status = MediaItemStatus.uploaded;
    this.touch(actorId);
    return ok(undefined);
  }

  /**
   * After display (and thumbnail) derivatives exist in storage: uploaded → ready.
   * Item-level width/height reflect the display derivative dimensions.
   */
  markReadyAfterDerivatives(
    input: { displayWidth: number; displayHeight: number },
    actorId: ActorId,
  ): WriteResult {
    if (this.props.status !== MediaItemStatus.uploaded) {
      return fail(AppErrorCollection.mediaItem.StatusNotPending);
    }
    const w = Math.round(input.displayWidth);
    const h = Math.round(input.displayHeight);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      return fail(ContractError.InvalidMediaDimensions);
    }
    this.props.width = w;
    this.props.height = h;
    this.props.status = MediaItemStatus.ready;
    this.touch(actorId);
    return ok(undefined);
  }

  protected childEntities(): ChildEntities {
    return {
      comments: this.#comments,
      assets: this.#assets,
    };
  }
}
