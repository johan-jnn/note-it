import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

export const options = Object.assign(
  {
    // For typing purpose only
    type: 'mariadb',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '3306'),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    entities: [join(__dirname, '../../src/**/*.entity.js')],
    migrations: [join(__dirname, '../migrations/*.js')],
  } satisfies DataSourceOptions,
  {
    type: process.env.DB_DRIVER,
  },
);
