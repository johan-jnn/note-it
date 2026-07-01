import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

export default {
  type: 'better-sqlite3',
  database: ':memory:',

  entities: [join(__dirname, '../../src/**/*.entity.ts')],
  migrations: [join(__dirname, '../migrations/*.ts')],
} satisfies DataSourceOptions;
