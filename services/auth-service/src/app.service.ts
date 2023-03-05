import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { LoginRequestDto } from './dto/login-request.dto';
import { User } from './models/user.model';
import { RegisterRequestDto } from './dto/register-request.dto';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';
import * as jose from 'node-jose';

@Injectable()
export class AppService {
  constructor(
    @Inject('USER_SERVICE') private client: ClientProxy,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginRequestDto: LoginRequestDto) {
    const pattern = { cmd: 'getUser' };
    const payload = loginRequestDto.username;

    const user = await firstValueFrom(
      this.client.send<User>(pattern, payload).pipe(
        catchError((err) => {
          throw new InternalServerErrorException('User service is down', err);
        }),
      ),
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.password !== loginRequestDto.password) {
      throw new BadRequestException('Invalid password');
    }

    user.password = undefined;
    return user;
  }

  async login(user: any) {
    const secret = fs.readFileSync('./certs/private.pem');

    user.iss = 'testing@istio.local';
    user.sub = 'testing@istio.local';

    const token = this.jwtService.sign(user, {
      secret,
      expiresIn: '3h',
      algorithm: 'RS256',
      header: {
        alg: 'RS256',
        kid: 'testing',
        typ: 'JWT',
      },
    });

    user.iss = undefined;
    user.sub = undefined;

    return {
      message: 'Login successful',
      data: { user, token },
    };
  }

  async register(registerRequestDto: RegisterRequestDto) {
    const pattern = { cmd: 'createUser' };
    const payload = registerRequestDto;

    const user = await firstValueFrom(
      this.client.send<User>(pattern, payload).pipe(
        catchError((err) => {
          console.log(err);
          throw new InternalServerErrorException('User service is down', err);
        }),
      ),
    );

    if (!user) {
      throw new InternalServerErrorException('User not created');
    }

    user.password = undefined;

    return {
      message: 'User created successfully',
      data: { user },
    };
  }

  profile(request: Request) {
    return {
      message: 'Profile fetched successfully',
      data: request.user,
    };
  }

  async getJwks() {
    const publicKey = fs.readFileSync('./certs/public.pem');
    const jwkKey = (await jose.JWK.asKey(publicKey, 'pem')).toJSON() as any;
    jwkKey.kid = 'testing';

    return {
      keys: [
        jwkKey,
      ],
    };
  }
}
