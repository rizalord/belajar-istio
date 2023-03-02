import { Injectable } from '@nestjs/common';
import { User } from './models/user.model';

@Injectable()
export class AppService {
  users: User[] = [];

  getByUsername(username: string): User {
    return this.users.find((user) => user.username === username) || null;
  }

  getAll(): User[] {
    return this.users;
  }

  create(user: User): User {
    this.users.push(user);
    return user;
  }

  update(user: User): User {
    const index = this.users.findIndex((u) => u.username === user.username);
    this.users[index] = user;
    return user;
  }

  delete(username: string): User {
    const user = this.getByUsername(username);
    this.users = this.users.filter((u) => u.username !== username);
    return user;
  }
}
