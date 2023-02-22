import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices/enums';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          port: 3001,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
