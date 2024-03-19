import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  // dto를 사용하기 위한 것
  app.useGlobalPipes(
    new ValidationPipe({
       // 자동으로 해당 타입으로 변환시킨다
      transform: true,
    }),
  );

  await app.listen(3000);
}

bootstrap();