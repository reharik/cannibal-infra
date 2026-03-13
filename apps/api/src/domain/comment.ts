/**
 * Comment: user comment attached to an Album or MediaItem (by resource type and ID).
 * Aggregate Root with its own lifecycle; references target and author by ID only.
 */

import { AggregateRoot } from "./AggregateRoot";
import type { EntityAuditRecord } from "./Entity";
import type { ActorId, EntityId } from "../types/types";
import type { ResourceTypeEnum } from "@packages/contracts";
import { ResourceTypeEnum as ResourceTypeEnumCollection } from "@packages/contracts";

export type CommentProps = {
  resourceType: ResourceTypeEnum;
  authorId: EntityId;
  content: string;
};

export type CommentRecord = {
  id: EntityId;
  resourceType: string;
  authorId: EntityId;
  content: string;
} & EntityAuditRecord;

export type CreateCommentInput = {
  resourceType: ResourceTypeEnum;
  authorId: EntityId;
  content: string;
};

export class Comment extends AggregateRoot<CommentRecord> {
  protected props: CommentProps;

  private constructor(id: EntityId, actorId: ActorId, props: CommentProps) {
    super(id, actorId);
    this.props = props;
  }

  static create(input: CreateCommentInput, actorId: ActorId): Comment {
    return new Comment(crypto.randomUUID(), actorId, {
      resourceType: input.resourceType,
      authorId: input.authorId,
      content: input.content,
    });
  }

  static rehydrate(record: CommentRecord): Comment {
    const comment = new Comment(record.id, record.createdBy, {
      resourceType: ResourceTypeEnumCollection.fromValue(record.resourceType),
      authorId: record.authorId,
      content: record.content,
    });

    comment.rehydrateAudit(record);

    return comment;
  }

  editContent(content: string, actorId: ActorId): void {
    this.props.content = content;
    this.touch(actorId);
  }
}
