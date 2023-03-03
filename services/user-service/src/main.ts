import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices/enums';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost',
      port: 3001,
    },
  });

  await app.startAllMicroservices();
  await app.listen(3003);
}
bootstrap();
