/**
 * ShareLink: token-based sharing for an Album or MediaItem with permissions and optional expiration.
 */

import type {
  ResourceTypeEnum,
  ShareLinkPermissionEnum,
} from "@app/contracts";
import { Entity, generateId, type AuditUser } from "./Entity";

export interface ShareLinkCreate {
  resourceType: ResourceTypeEnum;
  linkToken: string;
  permissions: ShareLinkPermissionEnum[];
  expiresAt?: Date;
}

export interface ShareLinkRehydrate {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: AuditUser;
  updatedBy: AuditUser;
  resourceType: ResourceTypeEnum;
  linkToken: string;
  permissions: ShareLinkPermissionEnum[];
  expiresAt?: Date;
}

export class ShareLink extends Entity<AuditUser> {
  #resourceType: ResourceTypeEnum;
  #linkToken: string;
  #permissions: ShareLinkPermissionEnum[];
  #expiresAt: Date | undefined;

  private constructor(
    id: string,
    resourceType: ResourceTypeEnum,
    linkToken: string,
    permissions: ShareLinkPermissionEnum[],
    expiresAt: Date | undefined,
    audit:
      | { actor: AuditUser }
      | {
          createdAt: Date;
          updatedAt: Date;
          createdBy: AuditUser;
          updatedBy: AuditUser;
        },
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
    this.#linkToken = linkToken;
    this.#permissions = [...permissions];
    this.#expiresAt = expiresAt;
  }

  static create(input: ShareLinkCreate, actor: AuditUser): ShareLink {
    return new ShareLink(
      generateId(),
      input.resourceType,
      input.linkToken,
      [...input.permissions],
      input.expiresAt,
      { actor },
    );
  }

  static rehydrate(data: ShareLinkRehydrate): ShareLink {
    return new ShareLink(
      data.id,
      data.resourceType,
      data.linkToken,
      [...data.permissions],
      data.expiresAt,
      {
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        createdBy: data.createdBy,
        updatedBy: data.updatedBy,
      },
    );
  }

  get resourceType(): ResourceTypeEnum {
    return this.#resourceType;
  }

  get linkToken(): string {
    return this.#linkToken;
  }

  get permissions(): readonly ShareLinkPermissionEnum[] {
    return [...this.#permissions];
  }

  get expiresAt(): Date | undefined {
    return this.#expiresAt;
  }

  updatePermissions(
    permissions: ShareLinkPermissionEnum[],
    actor: AuditUser,
  ): void {
    this.#permissions.length = 0;
    this.#permissions.push(...permissions);
    this.touch(actor);
  }

  updateExpiresAt(expiresAt: Date | undefined, actor: AuditUser): void {
    this.#expiresAt = expiresAt;
    this.touch(actor);
  }
}
