import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { FapAverage } from '../entities/fap-average.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(email: string, password: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
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

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials');
    }

    return user;
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
    await this.userRepository.update(id, { refreshToken });
  }

  async removeRefreshToken(id: string): Promise<void> {
    await this.userRepository.update(id, { refreshToken: undefined });
  }
}
