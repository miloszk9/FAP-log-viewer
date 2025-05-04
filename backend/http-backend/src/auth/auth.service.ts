import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../database/services/user.service';
import { User } from '../database/entities/user.entity';
import { AuthResponseDto, RefreshResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async create(email: string, password: string): Promise<User> {
    return this.userService.create(email, password);
  }

  async validateUser(email: string, password: string): Promise<User> {
    return this.userService.validateUser(email, password);
  }

  async login(user: User): Promise<AuthResponseDto> {
    const payload = { email: user.email, sub: user.id };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: '7d',
      }),
    ]);

    await this.userService.updateRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
    };
  }

  async refreshToken(user: User): Promise<RefreshResponseDto> {
    const payload = { email: user.email, sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
    };
  }

  async logout(user: User): Promise<void> {
    await this.userService.removeRefreshToken(user.id);
  }
}
