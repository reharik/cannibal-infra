/**
 * ShareLink: token-based sharing for an Album with permission and optional expiration.
 */

import { AggregateRoot } from "../AggregateRoot";
import type { EntityAuditRecord } from "../Entity";
import type { ActorId, EntityId } from "../../types/types";
import { ShareLinkPermissionEnum } from "@packages/contracts";

export type ShareLinkProps = {
  permission: ShareLinkPermissionEnum;
  linkToken: string;
  expiresAt?: Date;
};

export type ShareLinkRecord = {
  id: EntityId;
  permission: string;
  linkToken: string;
  expiresAt?: Date;
} & EntityAuditRecord;

export type CreateShareLinkInput = {
  permission: ShareLinkPermissionEnum;
};

export class ShareLink extends AggregateRoot<ShareLinkRecord> {
  protected props: ShareLinkProps;

  private constructor(id: EntityId, actorId: ActorId, props: ShareLinkProps) {
    super(id, actorId);
    this.props = props;
  }

  static create(input: CreateShareLinkInput, actorId: ActorId): ShareLink {
    const linkToken = crypto.randomUUID();
    return new ShareLink(crypto.randomUUID(), actorId, {
      permission: input.permission,
      linkToken,
    });
  }

  static rehydrate(record: ShareLinkRecord): ShareLink {
    const link = new ShareLink(record.id, record.createdBy, {
      permission: ShareLinkPermissionEnum.fromValue(record.permission),
      linkToken: record.linkToken,
      expiresAt: record.expiresAt,
    });

    link.rehydrateAudit(record);

    return link;
  }

  permission(): ShareLinkPermissionEnum {
    return this.props.permission;
  }

  linkToken(): string {
    return this.props.linkToken;
  }

  updatePermission(
    permission: ShareLinkPermissionEnum,
    actorId: ActorId,
  ): void {
    this.props.permission = permission;
    this.touch(actorId);
  }

  setExpiresAt(expiresAt: Date | undefined, actorId: ActorId): void {
    this.props.expiresAt = expiresAt;
    this.touch(actorId);
  }
}
