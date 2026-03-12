/**
 * AlbumItem: association between an Album and a MediaItem.
 * createdBy is the user who added the media item; createdAt is when it was added.
 */

import { Entity, generateId } from "./Entity";
import type { MediaItem } from "./mediaItem";
import type { User } from "./user";

export interface AlbumItemCreate {
  mediaItem: MediaItem;
}

export interface AlbumItemRehydrate {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: User;
  updatedBy: User;
  mediaItem: MediaItem;
}

export class AlbumItem extends Entity<User> {
  #mediaItem: MediaItem;

  private constructor(
    id: string,
    mediaItem: MediaItem,
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
    this.#mediaItem = mediaItem;
  }

  static create(input: AlbumItemCreate, actor: User): AlbumItem {
    return new AlbumItem(generateId(), input.mediaItem, { actor });
  }

  static rehydrate(data: AlbumItemRehydrate): AlbumItem {
    return new AlbumItem(data.id, data.mediaItem, {
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
    });
  }

  get mediaItem(): MediaItem {
    return this.#mediaItem;
  }
}
