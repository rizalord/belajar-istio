import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport'
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
    private readonly configService: ConfigService,
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
            host: this.configService.get('USER_SERVICE_HOST') || 'localhost',
            port: this.configService.get('USER_SERVICE_PORT') || 3001,
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
  @UseGuards(AuthGuard('jwt'))
  async analytics() {
    return await this.appService.getAnalytics();
  }
}
