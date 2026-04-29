import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { FapAnalysisService } from '../database/services/fap-analysis.service';
import { FapAverageService } from '../database/services/fap-average.service';
import { NatsService } from '../nats/nats.service';
import { AnalysisStatusEnum, FapAverageStatusEnum, FapAverageTypeEnum } from 'src/database/entities/enums';

@Injectable()
export class AverageService {
  private readonly logger = new Logger(AverageService.name);

  constructor(
    private readonly fapAnalysisService: FapAnalysisService,
    private readonly fapAverageService: FapAverageService,
    private readonly natsService: NatsService,
  ) {}

  async update(userId: string): Promise<void> {
    this.logger.log(`Updating averages for user ${userId}`);


    // Check pending analyses efficiently
    const allAnalyses = await this.fapAnalysisService.findAllByUserId(userId);
    if (allAnalyses.some((a) => a.status === AnalysisStatusEnum.PROCESSING)) {
      this.logger.log(`Found pending analysis for user ${userId}, skipping average update`);
      return;
    }

    // OVERALL
    const overallAnalyses = allAnalyses.filter(a => a.status === AnalysisStatusEnum.SUCCESS);
    await this.processGroup(userId, FapAverageTypeEnum.OVERALL, undefined, undefined, overallAnalyses);

    // Get distinct periods
    const periods = await this.fapAnalysisService.getDistinctPeriods(userId);
    
    // Group periods by year to process YEARLY
    const years = [...new Set(periods.map(p => p.logYear))];
    for (const year of years) {
      const yearlyAnalyses = await this.fapAnalysisService.findSuccessfulByPeriod(userId, year);
      await this.processGroup(userId, FapAverageTypeEnum.YEARLY, year, undefined, yearlyAnalyses);
    }

    // Process MONTHLY
    for (const period of periods) {
      const monthlyAnalyses = await this.fapAnalysisService.findSuccessfulByPeriod(userId, period.logYear, period.logMonth);
      await this.processGroup(userId, FapAverageTypeEnum.MONTHLY, period.logYear, period.logMonth, monthlyAnalyses);
    }
  }

  private async processGroup(userId: string, type: FapAverageTypeEnum, year: number | undefined, month: number | undefined, analyses: any[]) {
    if (analyses.length === 0) return;

    const analysisData = analyses.map(a => a.analysis);
    const analysisString = JSON.stringify(analysisData);
    const sha256 = createHash('sha256').update(analysisString).digest('hex');

    const currentAverage = await this.fapAverageService.findOne(userId, type, year, month);
    if (currentAverage?.sha256 === sha256 && currentAverage?.status === FapAverageStatusEnum.SUCCESS) {
      this.logger.log(`Average for user ${userId} [${type} ${year || ''} ${month || ''}] is up to date`);
      return;
    }

    await this.fapAverageService.upsert(userId, type, { status: FapAverageStatusEnum.CALCULATING }, year, month);

    await this.natsService.sendAverageRequest({
      userId,
      type,
      year,
      month,
      analysisSha: sha256,
      analysis: analysisData,
    });

    this.logger.log(`Average request sent for user ${userId} [${type} ${year || ''} ${month || ''}]`);
  }
}
