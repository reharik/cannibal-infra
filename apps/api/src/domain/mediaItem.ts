/**
 * MediaItem: uploaded media asset (photo or video) owned by a user (by ID).
 * Encapsulates metadata; can appear in multiple albums via AlbumItem.
 */

import { AggregateRoot } from "./AggregateRoot";
import type { ActorId, EntityId } from "../types/types";
import type { MediaItemKindEnum } from "@packages/contracts";
import { MediaItemKindEnum as MediaItemKindEnumCollection } from "@packages/contracts";
import type { ResourceTypeEnum } from "@packages/contracts";
import type { ChildEntities, EntityAuditRecord } from "./Entity";
import { Comment, CommentRecord } from "./comment";

export type MediaItemProps = {
  ownerId: EntityId;
  kind: MediaItemKindEnum;
  storageKey: string;
  mimeType: string;
  size: number;
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
  storageKey: string;
  mimeType: string;
  size: number;
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
  storageKey: string;
  mimeType: string;
  size: number;
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
    return new MediaItem(crypto.randomUUID(), actorId, {
      ownerId: input.ownerId,
      kind: input.kind,
      storageKey: input.storageKey,
      mimeType: input.mimeType,
      size: input.size,
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
      kind: MediaItemKindEnumCollection.fromValue(record.kind),
      storageKey: record.storageKey,
      mimeType: record.mimeType,
      size: record.size,
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

  protected childEntities(): ChildEntities {
    return {
      comments: this.#comments,
    };
  }
}
