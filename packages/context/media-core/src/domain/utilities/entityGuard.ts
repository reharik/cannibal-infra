import { Entity } from '../Entity';

export const isEntity = (value: unknown): value is Entity<Record<string, unknown>> => {
  return value instanceof Entity;
};
