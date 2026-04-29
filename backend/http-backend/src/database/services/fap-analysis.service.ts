import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FapAnalysis } from '../entities/fap-analysis.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FapAnalysisService {
  private readonly logger = new Logger(FapAnalysisService.name);
  private readonly dataAnalyserVersion: string;

  constructor(
    @InjectRepository(FapAnalysis)
    private fapAnalysisRepository: Repository<FapAnalysis>,
    private readonly configService: ConfigService,
  ) {
    this.dataAnalyserVersion =
      this.configService.get<string>('dataAnalyser.version') || '';
  }

  create(fapAnalysis: FapAnalysis): Promise<FapAnalysis> {
    this.logger.log(`Creating FapAnalysis for file ${fapAnalysis.fileName}`);
    return this.fapAnalysisRepository.save(fapAnalysis);
  }

  findAll(): Promise<FapAnalysis[]> {
    this.logger.log(`Finding all FapAnalyses`);
    return this.fapAnalysisRepository.find();
  }

  async findAllByUserId(userId: string): Promise<FapAnalysis[]> {
    this.logger.log(`Finding all FapAnalyses for user ${userId}`);
    return this.fapAnalysisRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async getDistinctPeriods(userId: string): Promise<{ logYear: number; logMonth: number }[]> {
    this.logger.log(`Finding distinct periods for user ${userId}`);
    const result = await this.fapAnalysisRepository
      .createQueryBuilder('fap_analysis')
      .select('fap_analysis.log_year', 'logYear')
      .addSelect('fap_analysis.log_month', 'logMonth')
      .where('fap_analysis.user_id = :userId', { userId })
      .andWhere('fap_analysis.status = :status', { status: 'Success' })
      .andWhere('fap_analysis.log_year IS NOT NULL')
      .andWhere('fap_analysis.log_month IS NOT NULL')
      .groupBy('fap_analysis.log_year')
      .addGroupBy('fap_analysis.log_month')
      .getRawMany();

    return result.map((r) => ({
      logYear: Number(r.logYear),
      logMonth: Number(r.logMonth),
    }));
  }

  async findSuccessfulByPeriod(userId: string, year?: number, month?: number): Promise<FapAnalysis[]> {
    this.logger.log(`Finding successful analyses for user ${userId}, year ${year}, month ${month}`);
    const qb = this.fapAnalysisRepository.createQueryBuilder('fap_analysis')
      .where('fap_analysis.user_id = :userId', { userId })
      .andWhere('fap_analysis.status = :status', { status: 'Success' });
    
    if (year) {
      qb.andWhere('fap_analysis.log_year = :year', { year });
    }
    if (month) {
      qb.andWhere('fap_analysis.log_month = :month', { month });
    }
    
    return qb.getMany();
  }

  async findAndCountByUserId(
    userId: string,
    options: {
      skip: number;
      take: number;
      sortBy: 'fileName' | 'createdAt';
      order: 'ASC' | 'DESC';
    },
  ): Promise<[FapAnalysis[], number]> {
    this.logger.log(
      `Finding FapAnalyses for user ${userId} with pagination: skip=${options.skip}, take=${options.take}, sortBy=${options.sortBy}, order=${options.order}`,
    );
    return this.fapAnalysisRepository.findAndCount({
      where: { user: { id: userId } },
      relations: ['user'],
      skip: options.skip,
      take: options.take,
      order: {
        [options.sortBy]: options.order,
      },
    });
  }

  async findOne(id: string): Promise<FapAnalysis | null> {
    this.logger.log(`Finding FapAnalysis ${id}`);
    const result = await this.fapAnalysisRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    this.logger.log(`Found FapAnalysis ${id} with status ${result?.status}`);
    return result || null;
  }

  async findBySha256(sha256: string): Promise<FapAnalysis | null> {
    this.logger.log(`Finding FapAnalysis by sha256 ${sha256}`);
    const result = await this.fapAnalysisRepository.findOne({
      where: { sha256 },
    });
    if (result) {
      this.logger.log(
        `Found FapAnalysis with sha256 ${sha256} with status ${result?.status}`,
      );
    } else {
      this.logger.log(`No FapAnalysis found with sha256 ${sha256}`);
    }
    return result || null;
  }

  async update(
    id: string,
    fapAnalysis: Partial<FapAnalysis>,
  ): Promise<FapAnalysis> {
    this.logger.log(
      `Updating FapAnalysis ${id} with status ${fapAnalysis.status}`,
    );
    fapAnalysis.version = this.dataAnalyserVersion;
    await this.fapAnalysisRepository.update(id, fapAnalysis);
    const updated = await this.findOne(id);
    if (!updated) {
      this.logger.error(`FapAnalysis with id ${id} not found`);
      throw new Error(`FapAnalysis with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing FapAnalysis ${id}`);
    await this.fapAnalysisRepository.delete(id);
  }
}
