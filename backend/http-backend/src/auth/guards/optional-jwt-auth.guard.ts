import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/database/entities/user.entity';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = User>(err: any, user: TUser): TUser | null {
    return user || null;
  }
}
