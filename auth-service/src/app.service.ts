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
import * as jwt from 'jsonwebtoken';
import { RegisterRequestDto } from './dto/register-request.dto';
import { Request } from 'express';

@Injectable()
export class AppService {
  constructor(@Inject('USER_SERVICE') private client: ClientProxy) {}

  async login(loginRequestDto: LoginRequestDto) {
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

    const token = jwt.sign(user, 'secret', { expiresIn: '1h' });

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
}
