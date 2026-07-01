import type { DataSourceOptions } from 'typeorm';
import appDatasource from './app.datasource';
import localDatasource from './local.datasource';
import testsDatasource from './tests.datasource';

export function runtimeDatasourceOptions(): DataSourceOptions {
  switch (process.env.NODE_ENV) {
    case 'production':
      return appDatasource;
    case 'tests':
      return testsDatasource;
    default:
      return localDatasource;
  }
}
