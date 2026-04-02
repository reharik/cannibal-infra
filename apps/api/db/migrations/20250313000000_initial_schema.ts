import type { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.createTable('user', (table) => {
    table.uuid('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('first_name', 255).notNullable();
    table.string('last_name', 255).notNullable();
    table.string('phone', 64).nullable();
    table.string('address_line1', 512).nullable();
    table.string('address_line2', 512).nullable();
    table.string('city', 255).nullable();
    table.string('postal_code', 32).nullable();
    table.string('state', 128).nullable();
    table.string('country', 128).nullable();
    table.string('password_hash', 255).nullable();
    table.timestamp('last_login_at').nullable();
    table.boolean('email_verified').notNullable().defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('updated_by').notNullable();
  });

  await knex.schema.createTable('album', (table) => {
    table.uuid('id').primary();
    table.string('title', 512).notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('updated_by').notNullable();
  });

  await knex.schema.createTable('media_item', (table) => {
    table.uuid('id').primary();
    table.uuid('owner_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.string('kind', 32).notNullable(); // photo | video
    table.string('storage_key', 1024).notNullable();
    table.string('mime_type', 128).notNullable();
    table.bigInteger('size').notNullable().unsigned();
    table.integer('width').unsigned().nullable();
    table.integer('height').unsigned().nullable();
    table.integer('duration_seconds').unsigned().nullable();
    table.string('title', 512).nullable();
    table.text('description').nullable();
    table.timestamp('taken_at').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('updated_by').notNullable();
  });

  await knex.schema.createTable('album_member', (table) => {
    table.uuid('id').primary();
    table.uuid('album_id').notNullable().references('id').inTable('album').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.string('role', 32).notNullable(); // viewer | contributor | admin
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('updated_by').notNullable();
    table.unique(['album_id', 'user_id']);
  });

  await knex.schema.createTable('album_item', (table) => {
    table.uuid('id').primary();
    table.uuid('album_id').notNullable().references('id').inTable('album').onDelete('CASCADE');
    table
      .uuid('media_item_id')
      .notNullable()
      .references('id')
      .inTable('media_item')
      .onDelete('CASCADE');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('updated_by').notNullable();
    table.unique(['album_id', 'media_item_id']);
  });

  await knex.schema.createTable('share_link', (table) => {
    table.uuid('id').primary();
    table.uuid('album_id').notNullable().references('id').inTable('album').onDelete('CASCADE');
    table.string('permission', 32).notNullable(); // view | comment | contribute
    table.string('link_token', 255).notNullable().unique();
    table.timestamp('expires_at').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('updated_by').notNullable();
  });

  await knex.schema.createTable('comment', (table) => {
    table.uuid('id').primary();
    table.string('resource_type', 32).notNullable(); // album | mediaItem
    table.uuid('resource_id').notNullable();
    table.uuid('author_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.text('content').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('updated_by').notNullable();
    table.index(['resource_type', 'resource_id']);
  });

  await knex.schema.createTable('notification', (table) => {
    table.uuid('id').primary();
    table.uuid('recipient_id').notNullable().references('id').inTable('user').onDelete('CASCADE');
    table.string('kind', 32).notNullable(); // shareInvite | albumShared | mediaAdded | comment | commentReply
    table.string('title', 512).notNullable();
    table.text('body').notNullable();
    table.timestamp('read_at').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').notNullable();
    table.uuid('updated_by').notNullable();
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTableIfExists('notification');
  await knex.schema.dropTableIfExists('comment');
  await knex.schema.dropTableIfExists('share_link');
  await knex.schema.dropTableIfExists('album_item');
  await knex.schema.dropTableIfExists('album_member');
  await knex.schema.dropTableIfExists('media_item');
  await knex.schema.dropTableIfExists('album');
  await knex.schema.dropTableIfExists('user');
};
