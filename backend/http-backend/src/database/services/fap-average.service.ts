import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FapAverage } from '../entities/fap-average.entity';
import { FapAverageTypeEnum } from '../entities/enums';

@Injectable()
export class FapAverageService {
  private readonly logger = new Logger(FapAverageService.name);

  constructor(
    @InjectRepository(FapAverage)
    private fapAverageRepository: Repository<FapAverage>,
  ) {}

  async findOne(userId: string, type: FapAverageTypeEnum = FapAverageTypeEnum.OVERALL, year?: number, month?: number): Promise<FapAverage | null> {
    this.logger.log(`Finding FapAverage for user ${userId}, type ${type}, year ${year}, month ${month}`);
    const whereClause: any = { user: { id: userId }, type };
    if (year !== undefined) whereClause.year = year;
    if (month !== undefined) whereClause.month = month;

    const result = await this.fapAverageRepository.findOne({
      where: whereClause,
      relations: ['user'],
    });
    this.logger.log(
      `Found FapAverage for user ${userId} with status ${result?.status}`,
    );
    return result || null;
  }

  async findAllForUser(userId: string): Promise<FapAverage[]> {
    return this.fapAverageRepository.find({
      where: { user: { id: userId } },
    });
  }

  async upsert(userId: string, type: FapAverageTypeEnum, fapAverage: Partial<FapAverage>, year?: number, month?: number): Promise<FapAverage> {
    this.logger.log(`Upserting FapAverage for user ${userId}, type ${type}, year ${year}, month ${month} with status ${fapAverage.status}`);
    const existing = await this.findOne(userId, type, year, month);
    
    if (existing) {
      await this.fapAverageRepository.update(existing.id, fapAverage);
      return this.findOne(userId, type, year, month) as Promise<FapAverage>;
    } else {
      const newAverage = this.fapAverageRepository.create({
        user: { id: userId },
        type,
        year: year ?? null,
        month: month ?? null,
        ...fapAverage,
      });
      return this.fapAverageRepository.save(newAverage);
    }
  }

  async update(
    userId: string,
    fapAverage: Partial<FapAverage>,
  ): Promise<FapAverage> {
    return this.upsert(userId, FapAverageTypeEnum.OVERALL, fapAverage);
  }
}
