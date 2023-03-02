import { CacheInterceptor, CacheKey, CacheTTL, Controller, Get, Post, Req } from '@nestjs/common';
import { Body, UseGuards, UseInterceptors } from '@nestjs/common/decorators';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import {
  HealthCheck,
  HealthCheckService,
} from '@nestjs/terminus/dist/health-check';
import {
  HttpHealthIndicator,
  MicroserviceHealthIndicator,
} from '@nestjs/terminus/dist/health-indicator';
import { Request } from 'express';
import { AppService } from './app.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';

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
      name: 'Auth Service',
      version: '1.0.0',
    };
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  login(@Req() req: Request) {
    return this.appService.login(req.user);
  }

  @Post('register')
  register(@Body() registerRequestDto: RegisterRequestDto) {
    return this.appService.register(registerRequestDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  profile(@Req() req: Request) {
    return this.appService.profile(req);
  }

  @Get('.well-known/jwks.json')
  @UseInterceptors(CacheInterceptor)
  getJwks() {
    return this.appService.getJwks();
  }
}
