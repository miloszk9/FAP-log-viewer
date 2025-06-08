import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../database/services/user.service';
import { User } from '../database/entities/user.entity';
import { AuthResponseDto, RefreshResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async create(email: string, password: string): Promise<User> {
    this.logger.log(`Creating new user with email: ${email}`);
    return this.userService.create(email, password);
  }

  async validateUser(email: string, password: string): Promise<User> {
    this.logger.log(`Validating user with email: ${email}`);
    return this.userService.validateUser(email, password);
  }

  async login(user: User): Promise<AuthResponseDto> {
    this.logger.log(`User ${user.email} (ID: ${user.id}) logging in`);
    const payload = { email: user.email, sub: user.id };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: '7d',
      }),
    ]);

    await this.userService.updateRefreshToken(user.id, refreshToken);
    this.logger.log(`Successfully generated tokens for user ${user.email}`);

    return {
      access_token: accessToken,
    };
  }

  async refreshToken(user: User): Promise<RefreshResponseDto> {
    this.logger.log(`Refreshing token for user ${user.email} (ID: ${user.id})`);
    const payload = { email: user.email, sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload);
    this.logger.log(
      `Successfully generated new access token for user ${user.email}`,
    );

    return {
      access_token: accessToken,
    };
  }

  async logout(user: User): Promise<void> {
    this.logger.log(`User ${user.email} (ID: ${user.id}) logging out`);
    await this.userService.removeRefreshToken(user.id);
    this.logger.log(
      `Successfully removed refresh token for user ${user.email}`,
    );
  }
}
