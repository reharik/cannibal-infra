import knex, { type Knex } from "knex";

export const buildDatabase = ({
  knexConfig,
}: {
  knexConfig: Knex.Config;
}): Knex => knex(knexConfig);
