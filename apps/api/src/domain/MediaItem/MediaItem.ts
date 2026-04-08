/**
 * MediaItem: uploaded media asset (photo or video) owned by a user (by ID).
 * Encapsulates metadata; can appear in multiple albums via AlbumItem.
 */

import type { ResourceTypeEnum } from '@packages/contracts';
import { AppErrorCollection, MediaItemStatus, MediaKind } from '@packages/contracts';
import type { ActorId, EntityId, WriteResult } from '../../types/types';
import { AggregateRoot } from '../AggregateRoot';
import { Comment, CommentRecord } from '../Comment/Comment';
import type { ChildEntities, EntityAuditRecord } from '../Entity';
import { fail, ok } from '../utilities/writeResponse';

export type MediaItemProps = {
  ownerId: EntityId;
  kind: MediaKind;
  status: MediaItemStatus;
  storageKey: string;
  mimeType: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  title?: string;
  description?: string;
  takenAt?: Date;
};

export type MediaItemRecord = {
  id: EntityId;
  ownerId: EntityId;
  kind: MediaKind;
  status: MediaItemStatus;
  storageKey: string;
  mimeType: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  title?: string;
  description?: string;
  takenAt?: Date;
  comments: CommentRecord[];
} & EntityAuditRecord;

export type CreateMediaItemInput = {
  kind: MediaKind;
  status?: MediaItemStatus;
  mimeType: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  title?: string;
  description?: string;
  takenAt?: Date;
};

export class MediaItem extends AggregateRoot<MediaItemRecord> {
  protected props: MediaItemProps;
  #comments: Comment[] = [];

  private constructor(id: EntityId, actorId: ActorId, props: MediaItemProps) {
    super(id, actorId);
    this.props = {
      ...props,
    };
    this.props.ownerId = actorId;
  }

  static create(input: CreateMediaItemInput, actorId: ActorId): MediaItem {
    const mediaItemId = crypto.randomUUID();
    return new MediaItem(mediaItemId, actorId, {
      ...input,
      sizeBytes: input.sizeBytes ?? 0,
      storageKey: `${actorId}/${input.kind.key}/${mediaItemId}`,
      status: MediaItemStatus.pending,
      ownerId: actorId,
    });
  }

  static rehydrate(record: MediaItemRecord): MediaItem {
    const mediaItem = new MediaItem(record.id, record.createdBy, record);

    mediaItem.rehydrateAudit(record);
    mediaItem.#comments = record.comments.map((r) => Comment.rehydrate(r));

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

  updateTitle(title: string | undefined, actorId: ActorId): void {
    this.props.title = title;
    this.touch(actorId);
  }

  updateDescription(description: string | undefined, actorId: ActorId): void {
    this.props.description = description;
    this.touch(actorId);
  }

  storageKey(): string {
    return this.props.storageKey;
  }

  ownerId(): EntityId {
    return this.props.ownerId;
  }

  status(): MediaItemStatus {
    return this.props.status;
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

  finalizeStatus(status: MediaItemStatus, actorId: ActorId): WriteResult {
    if (this.props.status !== MediaItemStatus.pending) {
      return fail(AppErrorCollection.mediaItem.StatusNotPending);
    }
    this.props.status = status;
    this.touch(actorId);
    return ok(undefined);
  }

  protected childEntities(): ChildEntities {
    return {
      comments: this.#comments,
    };
  }
}
