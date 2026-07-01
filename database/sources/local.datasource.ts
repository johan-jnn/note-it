import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

export const options = {
  type: 'better-sqlite3',
  database: join(process.cwd(), 'database/app.db'),

  entities: [join(__dirname, '../../src/**/*.entity.js')],
  migrations: [join(__dirname, '../migrations/*.js')],
} satisfies DataSourceOptions;
