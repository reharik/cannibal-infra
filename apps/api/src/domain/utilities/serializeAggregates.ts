import { Entity } from '../Entity';
import { isEntity } from './entityGuard';

export const serializeValue = (value: unknown): unknown => {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(serializeValue);
  if (isEntity(value)) return value.toPersistence();

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, serializeValue(nested)]),
    );
  }

  return value;
};

export const serializeEntity = <TRecord extends Record<string, unknown>, E extends Entity<TRecord>>(
  entity: E,
): TRecord => serializeValue(entity.persistenceState()) as TRecord;
