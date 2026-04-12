import knex, { type Knex } from 'knex';
import { IocGeneratedCradle } from './di/generated/ioc-registry.types';

export const buildDatabase = ({ knexConfig }: IocGeneratedCradle): Knex => knex(knexConfig);
