import type { AlbumMemberRoleEnum } from '@packages/contracts';
import { AppErrorCollection, MediaItemStatus } from '@packages/contracts';
import type { ActorId, EntityId, WriteResult } from '../../types/types';
import { AggregateRoot } from '../AggregateRoot';
import type { ChildEntities, EntityAuditRecord } from '../Entity';
import { fail, ok } from '../utilities/writeResponse';
import type { AlbumItemRecord } from './AlbumItem';
import { AlbumItem } from './AlbumItem';
import { AlbumMember, AlbumMemberRecord } from './AlbumMember';

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

  addItem(mediaItemId: EntityId, status: MediaItemStatus, actorId: ActorId): WriteResult {
    if (this.#items.some((i) => i.mediaItemId() === mediaItemId)) {
      return fail(AppErrorCollection.album.MediaAlreadyInAlbum);
    }
    if (status !== MediaItemStatus.ready) {
      return fail(AppErrorCollection.mediaItem.MediaItemNotReady);
    }
    this.#items.push(AlbumItem.create({ mediaItemId }, actorId));

    this.touch(actorId);
    return ok(undefined);
  }

  addMember(userId: EntityId, role: AlbumMemberRoleEnum, actorId: ActorId): WriteResult {
    if (this.#members.some((m) => m.userId() === userId)) {
      return fail(AppErrorCollection.album.UserAlreadyMember);
    }
    this.#members.push(AlbumMember.create({ userId, role }, actorId));
    this.touch(actorId);
    return ok(undefined);
  }

  /* Currently the rule is that album cover must be a reference to a 
  media item that is part of the album.  This is an easier implementation for now. 
  If we decide to open that up there are two ways to do it.  We could add a 
  role to the albumItem that state whether to display it or not ( in the album item list ),
  or perhaps just state that it's of kind albumCover.
  Another way would be to have the albumCoverMedia reference a media item directly with out
  requiring it to be part of the albumItems.  In the later case we must make sure to 
  check that the mediaItem has the status of ready as we wont have the previous albumItem check.*/
  setCoverMedia(mediaItemId: EntityId, actorId: ActorId): WriteResult {
    if (mediaItemId && !this.#items.some((i) => i.mediaItemId() === mediaItemId)) {
      return fail(AppErrorCollection.album.CoverMediaNotPartOfAlbum);
    }
    this.props.coverMediaId = mediaItemId;
    this.touch(actorId);
    return ok(undefined);
  }

  protected childEntities(): ChildEntities {
    return {
      items: this.#items,
      members: this.#members,
    };
  }
}
