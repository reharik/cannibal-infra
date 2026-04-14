import type { Knex } from 'knex';

/**
 * Canonical tags per user (`user_tag`), linked to media via `media_item_tag`.
 * `label_key` is lowercase for uniqueness; `label` preserves display casing.
 */
export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.createTable('user_tag', (table) => {
    table.uuid('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.string('label', 512).notNullable();
    table.string('label_key', 512).notNullable();
    table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('updated_by').notNullable();
    table.unique(['user_id', 'label_key']);
    table.index(['user_id']);
  });

  await knex.schema.createTable('media_item_tag', (table) => {
    table.uuid('id').primary();
    table
      .uuid('media_item_id')
      .notNullable()
      .references('id')
      .inTable('media_item')
      .onDelete('CASCADE');
    table
      .uuid('user_tag_id')
      .notNullable()
      .references('id')
      .inTable('user_tag')
      .onDelete('CASCADE');
    table.timestamp('created_at', { useTz: false }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: false }).notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('updated_by').notNullable();
    table.unique(['media_item_id', 'user_tag_id']);
    table.index(['user_tag_id']);
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTableIfExists('media_item_tag');
  await knex.schema.dropTableIfExists('user_tag');
};
