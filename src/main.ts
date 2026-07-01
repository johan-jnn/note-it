// Load potential .env files
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
expand(config());

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import { join } from 'path';
import { runtimeDatasourceOptions } from '../database/sources/_resolver';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');

  // ServeStaticModule only serves files that exist; client-side SvelteKit routes
  // (e.g. /classes/5) don't correspond to a real file, so fall back to index.html
  // for any unmatched GET request outside /api and let the SPA router take over.
  // Using { root } (rather than a raw absolute path) matches how ServeStaticModule
  // resolves files and avoids Express's dotfiles check tripping on path segments
  // above the project root.
  const frontendRoot = join(__dirname, '../frontend');
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile('index.html', { root: frontendRoot }, (err) => {
        if (err) next(err);
      });
    } else {
      next();
    }
  });

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
