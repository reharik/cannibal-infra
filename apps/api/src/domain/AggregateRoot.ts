import { Entity } from "./Entity";

export abstract class AggregateRoot<TRecord> extends Entity<TRecord> {
  public abstract toPersistence(): TRecord;
}
