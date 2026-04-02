import type { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable('album', (table) => {
    table
      .uuid('cover_media_id')
      .nullable()
      .references('id')
      .inTable('media_item')
      .onDelete('SET NULL');
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable('album', (table) => {
    table.dropColumn('cover_media_id');
  });
};
