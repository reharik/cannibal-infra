/**
 * AlbumItem: association between an Album and a MediaItem (by ID).
 * createdBy is the user who added the media item; createdAt is when it was added.
 */

import { Entity, type EntityAuditRecord } from "./Entity";
import type { ActorId, EntityId } from "../types/types";

export type AlbumItemProps = {
  mediaItemId: EntityId;
};

export type AlbumItemRecord = {
  id: EntityId;
  mediaItemId: EntityId;
} & EntityAuditRecord;

export class AlbumItem extends Entity<AlbumItemRecord> {
  protected props: AlbumItemProps;

  private constructor(id: EntityId, actorId: ActorId, props: AlbumItemProps) {
    super(id, actorId);
    this.props = props;
  }

  static create(props: AlbumItemProps, actorId: ActorId): AlbumItem {
    return new AlbumItem(crypto.randomUUID(), actorId, props);
  }

  static rehydrate(record: AlbumItemRecord): AlbumItem {
    const item = new AlbumItem(record.id, record.createdBy, {
      mediaItemId: record.mediaItemId,
    });

    item.rehydrateAudit(record);
    return item;
  }

  mediaItemId(): EntityId {
    return this.props.mediaItemId;
  }

  hasMediaItem(id: EntityId): boolean {
    return this.props.mediaItemId === id;
  }
}
