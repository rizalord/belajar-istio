import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Transport } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckService,
} from '@nestjs/terminus/dist/health-check';
import { MicroserviceHealthIndicator } from '@nestjs/terminus/dist/health-indicator';
import { AppService } from './app.service';
import { User } from './models/user.model';

@Controller()
export class AppController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly microservice: MicroserviceHealthIndicator,
    private readonly appService: AppService,
  ) {}

  @Get()
  getInfo() {
    return {
      name: 'User Service',
      version: '1.0.0',
    };
  }

  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([
      async () =>
        this.microservice.pingCheck('tcp', {
          transport: Transport.TCP,
          options: { host: 'localhost', port: 3001 },
        }),
    ]);
  }

  @MessagePattern({ cmd: 'getUser' })
  getUser(username: string): User {
    return this.appService.getByUsername(username);
  }

  @MessagePattern({ cmd: 'getAllUsers' })
  getAllUsers(): User[] {
    return this.appService.getAll();
  }

  @MessagePattern({ cmd: 'createUser' })
  createUser(user: User): User {
    return this.appService.create(user);
  }

  @MessagePattern({ cmd: 'updateUser' })
  updateUser(user: User): User {
    return this.appService.update(user);
  }

  @MessagePattern({ cmd: 'deleteUser' })
  deleteUser(username: string): User {
    return this.appService.delete(username);
  }
}
