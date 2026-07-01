import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FrontendMiddleware } from './frontend.middleware';

@Module({})
export class FrontendModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FrontendMiddleware);
  }
}
