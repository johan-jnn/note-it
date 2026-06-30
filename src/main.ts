import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { AppModule } from './app.module';

// Load potential .env files
expand(config());

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.APP_PORT ?? 3000;
  await app.listen(port);
  Logger.log(`App is now running on port ${port} (-> ${process.env.APP_HOST})`);
}
bootstrap().catch(console.error);
