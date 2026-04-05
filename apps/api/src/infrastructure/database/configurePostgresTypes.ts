// src/infrastructure/database/configurePostgresTypes.ts
import pg from 'pg';

let configured = false;

export const configurePostgresTypes = (): void => {
  if (configured) return;
  configured = true;

  const { types } = pg;

  // timestamp without time zone
  types.setTypeParser(1114, (value) => new Date(`${value}Z`));

  // timestamp with time zone
  types.setTypeParser(1184, (value) => new Date(value));
};
