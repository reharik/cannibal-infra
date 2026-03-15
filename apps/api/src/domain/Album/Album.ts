import { AggregateRoot } from "../AggregateRoot";
import type { ActorId, EntityId } from "../../types/types";
import type { AlbumMemberRoleEnum } from "@packages/contracts";
import type { ChildEntities, EntityAuditRecord } from "../Entity";
import { AlbumItem } from "./AlbumItem";
import type { AlbumItemRecord } from "./AlbumItem";
import { AlbumMember, AlbumMemberRecord } from "./AlbumMember";

export type AlbumProps = {
  title: string;
};

export type CreateAlbumInput = {
  title: string;
};

export type AlbumRecord = {
  id: EntityId;
  title: string;
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
    });

    album.rehydrateAudit(record);

    album.#items = record.items.map((r) => AlbumItem.rehydrate(r));
    album.#members = record.members.map((r) => AlbumMember.rehydrate(r));

    return album;
  }

  addItem(mediaItemId: EntityId, actorId: ActorId): void {
    if (this.#items.some((i) => i.mediaItemId() === mediaItemId))
      throw new Error("Media already in album");

    this.#items.push(AlbumItem.create({ mediaItemId }, actorId));

    this.touch(actorId);
  }

  addMember(
    userId: EntityId,
    role: AlbumMemberRoleEnum,
    actorId: ActorId,
  ): void {
    if (this.#members.some((m) => m.userId() === userId))
      throw new Error("User already member");
    this.#members.push(AlbumMember.create({ userId, role }, actorId));
    this.touch(actorId);
  }

  protected childEntities(): ChildEntities {
    return {
      items: this.#items,
      members: this.#members,
    };
  }
}
