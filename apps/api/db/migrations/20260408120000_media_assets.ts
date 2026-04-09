import type { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.createTable('media_asset', (table) => {
    table.uuid('id').primary();
    table
      .uuid('media_item_id')
      .notNullable()
      .references('id')
      .inTable('media_item')
      .onDelete('CASCADE');
    table.string('kind', 32).notNullable();
    table.string('mime_type', 128).notNullable();
    table.integer('width').unsigned().nullable();
    table.integer('height').unsigned().nullable();
    table.bigInteger('file_size_bytes').unsigned().nullable();
    table.string('status', 32).notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('updated_by').notNullable();
    table.unique(['media_item_id', 'kind']);
    table.index(['media_item_id']);
  });

  await knex.raw(`
    INSERT INTO media_asset (
      id,
      media_item_id,
      kind,
      mime_type,
      width,
      height,
      file_size_bytes,
      status,
      created_at,
      updated_at,
      created_by,
      updated_by
    )
    SELECT
      gen_random_uuid(),
      id,
      'original',
      mime_type,
      width,
      height,
      size_bytes,
      status,
      created_at,
      updated_at,
      created_by,
      updated_by
    FROM media_item
  `);

};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTableIfExists('media_asset');
};
