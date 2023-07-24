import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api', {
    exclude: ['/']
  })
  app.enableCors()
  await app.listen(process.env.PORT || 3100);
}

bootstrap();
