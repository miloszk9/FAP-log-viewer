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
