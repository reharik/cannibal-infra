import type { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable('album_item', (table) => {
    table.bigInteger('order_index').nullable();
  });

  await knex.raw(`
    UPDATE album_item AS ai
    SET order_index = sub.ord
    FROM (
      SELECT
        id,
        1000000000000::bigint
          + (ROW_NUMBER() OVER (
            PARTITION BY album_id
            ORDER BY created_at ASC, id ASC
          ) - 1) * 1000000000000::bigint AS ord
      FROM album_item
    ) AS sub
    WHERE ai.id = sub.id
  `);

  await knex.schema.alterTable('album_item', (table) => {
    table.bigInteger('order_index').notNullable().alter();
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable('album_item', (table) => {
    table.dropColumn('order_index');
  });
};
