/**
 * MediaItem: uploaded media asset (photo or video) owned by a user.
 * Encapsulates metadata; can appear in multiple albums via AlbumItem.
 */

import type { MediaItemKindEnum } from "@app/contracts";
import type { Comment } from "./comment";
import { Entity, generateId } from "./Entity";
import type { ShareLink } from "./shareLink";
import type { User } from "./user";

export interface MediaItemCreate {
  owner: User;
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
}

export interface MediaItemRehydrate {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: User;
  updatedBy: User;
  owner: User;
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
  comments?: readonly Comment[];
  shareLinks?: readonly ShareLink[];
}

export class MediaItem extends Entity<User> {
  #owner: User;
  #kind: MediaItemKindEnum;
  #storageKey: string;
  #mimeType: string;
  #size: number;
  #width: number | undefined;
  #height: number | undefined;
  #durationSeconds: number | undefined;
  #title: string | undefined;
  #description: string | undefined;
  #takenAt: Date | undefined;
  #comments: Comment[] = [];
  #shareLinks: ShareLink[] = [];

  private constructor(
    id: string,
    owner: User,
    kind: MediaItemKindEnum,
    storageKey: string,
    mimeType: string,
    size: number,
    width: number | undefined,
    height: number | undefined,
    durationSeconds: number | undefined,
    title: string | undefined,
    description: string | undefined,
    takenAt: Date | undefined,
    comments: Comment[],
    shareLinks: ShareLink[],
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
    this.#owner = owner;
    this.#kind = kind;
    this.#storageKey = storageKey;
    this.#mimeType = mimeType;
    this.#size = size;
    this.#width = width;
    this.#height = height;
    this.#durationSeconds = durationSeconds;
    this.#title = title;
    this.#description = description;
    this.#takenAt = takenAt;
    this.#comments = [...comments];
    this.#shareLinks = [...shareLinks];
  }

  static create(input: MediaItemCreate, actor: User): MediaItem {
    return new MediaItem(
      generateId(),
      input.owner,
      input.kind,
      input.storageKey,
      input.mimeType,
      input.size,
      input.width,
      input.height,
      input.durationSeconds,
      input.title,
      input.description,
      input.takenAt,
      [],
      [],
      { actor },
    );
  }

  static rehydrate(data: MediaItemRehydrate): MediaItem {
    return new MediaItem(
      data.id,
      data.owner,
      data.kind,
      data.storageKey,
      data.mimeType,
      data.size,
      data.width,
      data.height,
      data.durationSeconds,
      data.title,
      data.description,
      data.takenAt,
      data.comments ? [...data.comments] : [],
      data.shareLinks ? [...data.shareLinks] : [],
      {
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
      },
    );
  }

  get owner(): User {
    return this.#owner;
  }

  get kind(): MediaItemKindEnum {
    return this.#kind;
  }

  get storageKey(): string {
    return this.#storageKey;
  }

  get mimeType(): string {
    return this.#mimeType;
  }

  get size(): number {
    return this.#size;
  }

  get width(): number | undefined {
    return this.#width;
  }

  get height(): number | undefined {
    return this.#height;
  }

  get durationSeconds(): number | undefined {
    return this.#durationSeconds;
  }

  get title(): string | undefined {
    return this.#title;
  }

  get description(): string | undefined {
    return this.#description;
  }

  get takenAt(): Date | undefined {
    return this.#takenAt;
  }

  get comments(): readonly Comment[] {
    return [...this.#comments];
  }

  get shareLinks(): readonly ShareLink[] {
    return [...this.#shareLinks];
  }

  updateTitle(title: string | undefined, actor: User): void {
    this.#title = title;
    this.touch(actor);
  }

  updateDescription(description: string | undefined, actor: User): void {
    this.#description = description;
    this.touch(actor);
  }

  addComment(comment: Comment, actor: User): void {
    this.#comments.push(comment);
    this.touch(actor);
  }

  addShareLink(shareLink: ShareLink, actor: User): void {
    this.#shareLinks.push(shareLink);
    this.touch(actor);
  }
}
