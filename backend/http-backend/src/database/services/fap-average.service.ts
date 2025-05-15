import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FapAverage } from '../entities/fap-average.entity';

@Injectable()
export class FapAverageService {
  private readonly logger = new Logger(FapAverageService.name);

  constructor(
    @InjectRepository(FapAverage)
    private fapAverageRepository: Repository<FapAverage>,
  ) {}

  async findOne(userId: string): Promise<FapAverage | null> {
    this.logger.log(`Finding FapAverage for user ${userId}`);
    const result = await this.fapAverageRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    this.logger.log(
      `Found FapAverage for user ${userId} with status ${result?.status}`,
    );
    return result || null;
  }

  async update(
    userId: string,
    fapAverage: Partial<FapAverage>,
  ): Promise<FapAverage> {
    this.logger.log(
      `Updating FapAverage for user ${userId} with status ${fapAverage.status}`,
    );
    const existing = await this.findOne(userId);
    if (!existing) {
      this.logger.error(`FapAverage for user ${userId} not found`);
      throw new Error(`FapAverage for user ${userId} not found`);
    }
    await this.fapAverageRepository.update(existing.id, fapAverage);
    const updated = await this.findOne(userId);
    if (!updated) {
      this.logger.error(`FapAverage for user ${userId} not found after update`);
      throw new Error(`FapAverage for user ${userId} not found after update`);
    }
    return updated;
  }
}
