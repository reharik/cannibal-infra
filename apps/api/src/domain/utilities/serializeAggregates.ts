import { isSmartEnumItem } from "smart-enums";
import { Entity } from "../Entity";
import { isEntity } from "./entityGuard";

export const serializeValue = (value: unknown): unknown => {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) return value.map(serializeValue);

  if (isSmartEnumItem(value)) return value.value;

  if (isEntity(value)) return value.toPersistence();

  if (typeof value === "object") return serializeObject(value);

  return value;
};

export const serializeObject = (obj: object): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    result[key] = serializeValue(value);
  }

  return result;
};

export const serializeEntity = <
  TRecord extends Record<string, unknown>,
  E extends Entity<TRecord>,
>(
  obj: E,
): TRecord => {
  const state = obj.persistenceState();
  const result = {} as TRecord;

  for (const [key, value] of Object.entries(state)) {
    const recordKey = key as keyof TRecord;

    if (value === null || value === undefined) {
      result[recordKey] = value as TRecord[keyof TRecord];
      continue;
    }

    if (Array.isArray(value)) {
      result[recordKey] = value.map(serializeValue) as TRecord[keyof TRecord];
      continue;
    }

    if (isSmartEnumItem(value)) {
      result[recordKey] = value.value as TRecord[keyof TRecord];
      continue;
    }

    if (isEntity(value)) {
      result[recordKey] = value.toPersistence() as TRecord[keyof TRecord];
      continue;
    }

    if (typeof value === "object") {
      result[recordKey] = serializeObject(value) as TRecord[keyof TRecord];
      continue;
    }

    result[recordKey] = value as TRecord[keyof TRecord];
  }

  return result;
};
