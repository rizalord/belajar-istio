import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/models/user.model';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const bearer = req.headers.authorization;
    if (!bearer) {
      throw new UnauthorizedException('Unathenticated');
    }

    const token = bearer.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Unathenticated');
    }

    try {
      req.user = jwt.verify(token, 'secret') as User;
    } catch (error) {
      throw new UnauthorizedException('Unathenticated');
    }

    next();
  }
}
