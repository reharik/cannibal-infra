import type { ActorId, EntityId } from "../types/types";

export interface Persistable<TRecord> {
  toPersistence(): TRecord;
  persistenceState(): Record<string, unknown>;
}

export type EntityAuditRecord = {
  createdAt: Date;
  updatedAt: Date;
  createdBy: ActorId;
  updatedBy: ActorId;
};

export abstract class Entity<
  TRecord extends Record<string, unknown>,
> implements Persistable<TRecord> {
  readonly #id: EntityId;

  #createdAt: Date;
  #updatedAt: Date;
  #createdBy: ActorId;
  #updatedBy: ActorId;

  protected constructor(id: EntityId, actorId: ActorId) {
    const now = new Date();

    this.#id = id;
    this.#createdAt = now;
    this.#updatedAt = now;
    this.#createdBy = actorId;
    this.#updatedBy = actorId;
  }

  protected rehydrateAudit(audit: EntityAuditRecord): void {
    this.#createdAt = audit.createdAt;
    this.#updatedAt = audit.updatedAt;
    this.#createdBy = audit.createdBy;
    this.#updatedBy = audit.updatedBy;
  }

  touch(actorId: ActorId): void {
    this.#updatedAt = new Date();
    this.#updatedBy = actorId;
  }

  protected exportAudit(): EntityAuditRecord {
    return {
      createdAt: this.#createdAt,
      updatedAt: this.#updatedAt,
      createdBy: this.#createdBy,
      updatedBy: this.#updatedBy,
    };
  }

  public id(): EntityId {
    return this.#id;
  }

  public abstract persistenceState(): Record<string, unknown>;
  public abstract toPersistence(): TRecord;
}
