import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FapAnalysis } from '../entities/fap-analysis.entity';

@Injectable()
export class FapAnalysisService {
  constructor(
    @InjectRepository(FapAnalysis)
    private fapAnalysisRepository: Repository<FapAnalysis>,
  ) {}

  create(fapAnalysis: FapAnalysis): Promise<FapAnalysis> {
    return this.fapAnalysisRepository.save(fapAnalysis);
  }

  findAll(): Promise<FapAnalysis[]> {
    return this.fapAnalysisRepository.find();
  }

  async findOne(id: string): Promise<FapAnalysis | null> {
    const result = await this.fapAnalysisRepository.findOne({ where: { id } });
    return result || null;
  }

  async update(
    id: string,
    fapAnalysis: Partial<FapAnalysis>,
  ): Promise<FapAnalysis> {
    await this.fapAnalysisRepository.update(id, fapAnalysis);
    const updated = await this.findOne(id);
    if (!updated) {
      throw new Error(`FapAnalysis with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.fapAnalysisRepository.delete(id);
  }
}
