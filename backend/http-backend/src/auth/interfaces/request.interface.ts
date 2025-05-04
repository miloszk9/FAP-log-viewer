import { User } from '../../database/entities/user.entity';

export interface RequestWithUser extends Request {
  user: User;
}
