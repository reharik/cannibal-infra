import type { WriteResult } from "../../types/types";
import { fail, ok } from "../utilities/writeResponse";
import { AggregateRoot } from "../AggregateRoot";
import type { ActorId, EntityId } from "../../types/types";
import { AppErrorCollection } from "@packages/contracts";
import type { AlbumMemberRoleEnum } from "@packages/contracts";
import type { ChildEntities, EntityAuditRecord } from "../Entity";
import { AlbumItem } from "./AlbumItem";
import type { AlbumItemRecord } from "./AlbumItem";
import { AlbumMember, AlbumMemberRecord } from "./AlbumMember";

export type AlbumProps = {
  title: string;
  coverMediaId?: EntityId;
};

export type CreateAlbumInput = {
  title: string;
};

export type AlbumRecord = {
  id: EntityId;
  title: string;
  coverMediaId?: EntityId;
  items: AlbumItemRecord[];
  members: AlbumMemberRecord[];
} & EntityAuditRecord;

export class Album extends AggregateRoot<AlbumRecord> {
  protected props: AlbumProps;

  #items: AlbumItem[] = [];
  #members: AlbumMember[] = [];

  private constructor(id: EntityId, actorId: ActorId, props: AlbumProps) {
    super(id, actorId);
    this.props = props;
  }

  static create(input: CreateAlbumInput, actorId: ActorId): Album {
    return new Album(crypto.randomUUID(), actorId, {
      title: input.title,
    });
  }

  static rehydrate(record: AlbumRecord): Album {
    const album = new Album(record.id, record.createdBy, {
      title: record.title,
      coverMediaId: record.coverMediaId,
    });

    album.rehydrateAudit(record);

    album.#items = record.items.map((r) => AlbumItem.rehydrate(r));
    album.#members = record.members.map((r) => AlbumMember.rehydrate(r));

    return album;
  }

  addItem(mediaItemId: EntityId, actorId: ActorId): WriteResult {
    if (this.#items.some((i) => i.mediaItemId() === mediaItemId)) {
      return fail(AppErrorCollection.album.MediaAlreadyInAlbum);
    }
    this.#items.push(AlbumItem.create({ mediaItemId }, actorId));

    this.touch(actorId);
    return ok();
  }

  addMember(
    userId: EntityId,
    role: AlbumMemberRoleEnum,
    actorId: ActorId,
  ): WriteResult {
    if (this.#members.some((m) => m.userId() === userId)) {
      return fail(AppErrorCollection.album.UserAlreadyMember);
    }
    this.#members.push(AlbumMember.create({ userId, role }, actorId));
    this.touch(actorId);
    return ok();
  }

  setCoverMedia(
    mediaItemId: EntityId | undefined,
    actorId: ActorId,
  ): WriteResult {
    if (
      mediaItemId &&
      !this.#items.some((i) => i.mediaItemId() === mediaItemId)
    ) {
      return fail(AppErrorCollection.album.CoverMediaNotPartOfAlbum);
    }
    this.props.coverMediaId = mediaItemId;
    this.touch(actorId);
    return ok();
  }

  protected childEntities(): ChildEntities {
    return {
      items: this.#items,
      members: this.#members,
    };
  }
}
