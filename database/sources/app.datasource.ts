import { join } from 'path';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'mariadb',

  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,

  entities: [join(__dirname, '../../src/**/*.entity.ts')],
  migrations: [join(__dirname, '../migrations/*.ts')],
});
