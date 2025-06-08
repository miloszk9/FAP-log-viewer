import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { genSalt, hash, compare } from 'bcryptjs';
import { Repository } from 'typeorm';
import { FapAverage } from '../entities/fap-average.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(email: string, password: string): Promise<User> {
    this.logger.log(`Attempting to create user with email: ${email}`);
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      this.logger.warn(`User creation failed - email already exists: ${email}`);
      throw new ConflictException('Email already exists');
    }

    this.logger.log('Starting hashing password');
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    this.logger.log('Password hashed successfully');

    const fapAverage = new FapAverage();
    fapAverage.status = '';
    fapAverage.message = '';
    fapAverage.sha256 = '';
    fapAverage.average = {};

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      average: fapAverage,
    });
    const savedUser = await this.userRepository.save(user);
    this.logger.log(`Successfully created user with email: ${email}`);
    return savedUser;
  }

  async findByEmail(email: string): Promise<User> {
    this.logger.debug(`Looking up user by email: ${email}`);
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      this.logger.warn(`User not found with email: ${email}`);
      throw new NotFoundException('User not found');
    }

    this.logger.log(`Found user with email: ${email}`);
    return user;
  }

  async validateUser(email: string, password: string): Promise<User> {
    this.logger.log(`Validating user credentials for email: ${email}`);
    const user = await this.findByEmail(email);

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Invalid password attempt for user: ${email}`);
      throw new NotFoundException('Invalid credentials');
    }

    this.logger.log(`Successfully validated user: ${email}`);
    return user;
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
    await this.userRepository.update(id, { refreshToken });
    this.logger.log(`Successfully updated refresh token for user ID: ${id}`);
  }

  async removeRefreshToken(id: string): Promise<void> {
    await this.userRepository.update(id, { refreshToken: undefined });
    this.logger.log(`Successfully removed refresh token for user ID: ${id}`);
  }
}
