import { AlbumMemberRoleEnum } from '@packages/contracts';
import type { ActorId, EntityId } from '../../types/types';
import { Entity, type EntityAuditRecord } from '../Entity';

export type AlbumMemberProps = {
  userId: EntityId;
  role: AlbumMemberRoleEnum;
};

export type AlbumMemberRecord = {
  id: EntityId;
  userId: EntityId;
  role: AlbumMemberRoleEnum;
} & EntityAuditRecord;

export class AlbumMember extends Entity<AlbumMemberRecord> {
  protected props: AlbumMemberProps;

  private constructor(id: EntityId, actorId: ActorId, props: AlbumMemberProps) {
    super(id, actorId);
    this.props = props;
  }

  public static create(props: AlbumMemberProps, actorId: ActorId): AlbumMember {
    return new AlbumMember(crypto.randomUUID(), actorId, props);
  }

  public static rehydrate(record: AlbumMemberRecord): AlbumMember {
    const member = new AlbumMember(record.id, record.createdBy, {
      userId: record.userId,
      role: record.role,
    });

    member.rehydrateAudit(record);

    return member;
  }

  public userId(): string {
    return this.props.userId;
  }

  public role(): AlbumMemberRoleEnum {
    return this.props.role;
  }

  public changeRole(role: AlbumMemberRoleEnum, actorId: ActorId): void {
    this.props.role = role;
    this.touch(actorId);
  }
}
