import { join } from 'path';
import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm/browser';

export default new DataSource(
  Object.assign(
    {
      // For typing purpose only
      type: 'mariadb',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '3306'),
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,

      entities: [join(__dirname, '../../src/**/*.entity.ts')],
      migrations: [join(__dirname, '../migrations/*.ts')],
    } satisfies DataSourceOptions,
    {
      type: process.env.DB_DRIVER,
    },
  ),
);
