import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { FapAnalysisService } from '../database/services/fap-analysis.service';
import { FapAverageService } from '../database/services/fap-average.service';
import { NatsService } from '../nats/nats.service';
import { AnalysisStatusEnum } from 'src/database/entities/enums';

@Injectable()
export class AverageService {
  private readonly logger = new Logger(AverageService.name);

  constructor(
    private readonly fapAnalysisService: FapAnalysisService,
    private readonly fapAverageService: FapAverageService,
    private readonly natsService: NatsService,
  ) {}

  async update(userId: string): Promise<void> {
    this.logger.log(`Updating average for user ${userId}`);

    // Get all analyses for the user
    const analyses = await this.fapAnalysisService.findAllByUserId(userId);

    // Check if any analysis is pending
    const hasPending = analyses.some(
      (analysis) => analysis.status === AnalysisStatusEnum.PROCESSING,
    );
    if (hasPending) {
      this.logger.log(
        `Found pending analysis for user ${userId}, skipping average update`,
      );
      return;
    }

    // Build array of successful analyses
    const successfulAnalyses = analyses
      .filter((analysis) => analysis.status === AnalysisStatusEnum.SUCCESS)
      .map((analysis) => analysis.analysis);

    if (successfulAnalyses.length === 0) {
      this.logger.warn(`No successful analyses found for user ${userId}`);
      return;
    }

    // Calculate SHA256 of the array
    const analysisString = JSON.stringify(successfulAnalyses);
    const sha256 = createHash('sha256').update(analysisString).digest('hex');

    // Check if current average has the same SHA256
    const currentAverage = await this.fapAverageService.findOne(userId);
    if (currentAverage?.sha256 === sha256) {
      this.logger.log(`Average for user ${userId} is up to date`);
      return;
    }

    // Send average request
    await this.natsService.sendAverageRequest({
      userId,
      analysisSha: sha256,
      analysis: successfulAnalyses as Record<string, any>[],
    });

    this.logger.log(`Average request sent for user ${userId}`);
  }
}
