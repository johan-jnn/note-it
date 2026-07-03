// Load potential .env files
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
expand(config());

import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { runtimeDatasourceOptions } from '../database/sources/_resolver';
import { AppModule } from './app.module';
import { FrontendMiddleware } from './common/middlewares/frontend.middleware';

async function bootstrap() {
  Logger.log(
    `Using database driver: ${runtimeDatasourceOptions().type}`,
    'Boostraper',
  );

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.setGlobalPrefix('api');

  // We use this syntax to skip the 'api' prefixing
  const frontResolver = new FrontendMiddleware();
  app.use(frontResolver.use.bind(frontResolver));

  const port = process.env.APP_PORT ?? 3000;
  await app.listen(port);
  Logger.log(
    `App is accessible in ${process.env.NODE_ENV ?? 'local'} mode at ${process.env.APP_HOST} (port: ${port})`,
    'Bootstraper',
  );
}
bootstrap().catch(console.error);
