// Load potential .env files
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
expand(config());

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { runtimeDatasourceOptions } from '../database/sources/_resolver';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.APP_PORT ?? 3000;
  await app.listen(port);
  Logger.log(
    `App is now running (${process.env.NODE_ENV ?? 'local'}) on port ${port} (-> ${process.env.APP_HOST})`,
    'Bootstraper',
  );
  Logger.log(
    `Using database driver: ${runtimeDatasourceOptions().type}`,
    'Boostraper',
  );
}
bootstrap().catch(console.error);
