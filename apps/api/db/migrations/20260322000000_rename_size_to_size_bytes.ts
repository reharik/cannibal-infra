import type { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable('media_item', (table) => {
    table.renameColumn('size', 'size_bytes');
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable('media_item', (table) => {
    table.renameColumn('size_bytes', 'size');
  });
};
