/**
 * MediaItem: uploaded media asset (photo or video) owned by a user (by ID).
 * Encapsulates metadata; can appear in multiple albums via AlbumItem.
 */

import { AggregateRoot } from "../AggregateRoot";
import type { ActorId, EntityId, WriteResult } from "../../types/types";
import { MediaItemKindEnum, MediaItemStatusEnum } from "@packages/contracts";
import type { ResourceTypeEnum } from "@packages/contracts";
import type { ChildEntities, EntityAuditRecord } from "../Entity";
import { Comment, CommentRecord } from "../Comment/Comment";
import { fail, ok } from "../utilities/writeResponse";
import { AppErrorCollection } from "@packages/contracts";

export type MediaItemProps = {
  ownerId: EntityId;
  kind: MediaItemKindEnum;
  status: MediaItemStatusEnum;
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
  kind: string;
  status: string;
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
  ownerId: EntityId;
  kind: MediaItemKindEnum;
  status?: MediaItemStatusEnum;
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
    this.props = props;
  }

  static create(input: CreateMediaItemInput, actorId: ActorId): MediaItem {
    const mediaItemId = crypto.randomUUID();
    return new MediaItem(mediaItemId, actorId, {
      ownerId: input.ownerId,
      kind: input.kind,
      status: MediaItemStatusEnum.pending,
      storageKey: `media/${input.ownerId}/${input.kind.key}/${mediaItemId}`,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      width: input.width,
      height: input.height,
      durationSeconds: input.durationSeconds,
      title: input.title,
      description: input.description,
      takenAt: input.takenAt,
    });
  }

  static rehydrate(record: MediaItemRecord): MediaItem {
    const mediaItem = new MediaItem(record.id, record.createdBy, {
      ownerId: record.ownerId,
      kind: MediaItemKindEnum.fromValue(record.kind),
      status: MediaItemStatusEnum.fromValue(record.status),
      storageKey: record.storageKey,
      mimeType: record.mimeType,
      sizeBytes: record.sizeBytes,
      width: record.width,
      height: record.height,
      durationSeconds: record.durationSeconds,
      title: record.title,
      description: record.description,
      takenAt: record.takenAt,
    });

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

  status(): MediaItemStatusEnum {
    return this.props.status;
  }

  finalizeStatus(status: MediaItemStatusEnum, actorId: ActorId): WriteResult {
    if (this.props.status !== MediaItemStatusEnum.pending) {
      return fail(AppErrorCollection.mediaItem.StatusNotPending);
    }
    this.props.status = status;
    this.touch(actorId);
    return ok();
  }

  protected childEntities(): ChildEntities {
    return {
      comments: this.#comments,
    };
  }
}
