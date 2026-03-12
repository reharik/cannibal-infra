/**
 * Comment: user comment attached to an Album or MediaItem.
 */

import type { ResourceTypeEnum } from "@app/contracts";
import { Entity, generateId } from "./Entity";
import type { User } from "./user";

export interface CommentCreate {
  resourceType: ResourceTypeEnum;
  author: User;
  content: string;
}

export interface CommentRehydrate {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: User;
  updatedBy: User;
  resourceType: ResourceTypeEnum;
  author: User;
  content: string;
}

export class Comment extends Entity<User> {
  #resourceType: ResourceTypeEnum;
  #author: User;
  #content: string;

  private constructor(
    id: string,
    resourceType: ResourceTypeEnum,
    author: User,
    content: string,
    audit:
      | { actor: User }
      | { createdAt: Date; updatedAt: Date; createdBy: User; updatedBy: User },
  ) {
    if ("actor" in audit) {
      super(id, audit.actor);
    } else {
      super(
        id,
        audit.createdAt,
        audit.updatedAt,
        audit.createdBy,
        audit.updatedBy,
      );
    }
    this.#resourceType = resourceType;
    this.#author = author;
    this.#content = content;
  }

  static create(input: CommentCreate, actor: User): Comment {
    return new Comment(
      generateId(),
      input.resourceType,
      input.author,
      input.content,
      { actor },
    );
  }

  static rehydrate(data: CommentRehydrate): Comment {
    return new Comment(data.id, data.resourceType, data.author, data.content, {
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
    });
  }

  get resourceType(): ResourceTypeEnum {
    return this.#resourceType;
  }

  get author(): User {
    return this.#author;
  }

  get content(): string {
    return this.#content;
  }

  editContent(content: string, actor: User): void {
    this.#content = content;
    this.touch(actor);
  }
}
