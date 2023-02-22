import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom } from 'rxjs';
import { User } from './models/user.model';

@Injectable()
export class AppService {
  constructor(@Inject('USER_SERVICE') private client: ClientProxy) {}

  async getAnalytics() {
    const pattern = { cmd: 'getAllUsers' };
    const payload = {};

    const users = await firstValueFrom(
      this.client.send<User[]>(pattern, payload).pipe(
        catchError((err) => {
          throw new InternalServerErrorException('User service is down', err);
        }),
      ),
    );

    return {
      message: 'Get analytics successfully',
      data: users,
    };
  }
}
