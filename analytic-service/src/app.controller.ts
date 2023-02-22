import { Controller, Get } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckService,
} from '@nestjs/terminus/dist/health-check';
import {
  HttpHealthIndicator,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus/dist/health-indicator';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly microservice: MicroserviceHealthIndicator,
    private readonly appService: AppService,
  ) {}

  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('google', 'https://google.com'),
      async () =>
        this.microservice.pingCheck('tcp-user-service', {
          transport: Transport.TCP,
          options: {
            host: 'localhost',
            port: 3001,
          },
        }),
    ]);
  }

  @Get()
  getInfo() {
    return {
      name: 'Analytic Service',
      version: '1.0.0',
    };
  }

  @Get('analytics')
  async analytics() {
    return await this.appService.getAnalytics();
  }

}
