import { join } from 'path';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'better-sqlite3',
  database: ':memory:',

  entities: [join(__dirname, '../../src/**/*.entity.ts')],
  migrations: [join(__dirname, '../migrations/*.ts')],
});
