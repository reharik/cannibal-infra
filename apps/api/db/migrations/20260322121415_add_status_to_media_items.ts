import type { Knex } from "knex";

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable("media_items", (table) => {
    table.string("status").notNullable().defaultTo("pending");
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.alterTable("media_items", (table) => {
    table.dropColumn("status");
  });
};
