import { DataSource, type DataSourceOptions } from 'typeorm';
import { options as appDsOptions } from './app.datasource';
import { options as localDsOptions } from './local.datasource';
import { options as testDsOptions } from './tests.datasource';

export function runtimeDatasourceOptions(): DataSourceOptions {
  switch (process.env.NODE_ENV) {
    case 'production':
      return appDsOptions;
    case 'tests':
      return testDsOptions;
    default:
      return localDsOptions;
  }
}
export default new DataSource(runtimeDatasourceOptions());
