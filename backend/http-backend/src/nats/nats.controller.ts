import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FapAnalysisService } from '../database/services/fap-analysis.service';
import { AnalysisResultDto } from './dto/analysis-result.dto';
import { AverageResultDto } from './dto/average-result.dto';
import { FapAverageService } from '../database/services/fap-average.service';
import { AverageService } from '../average/average.service';

@Controller()
export class NatsController {
  constructor(
    private readonly averageService: AverageService,
    private readonly fapAnalysisService: FapAnalysisService,
    private readonly fapAverageService: FapAverageService,
  ) {}

  @MessagePattern('analysis.result')
  async handleAnalysisResult(@Payload() data: AnalysisResultDto) {
    const logDate = data.logDate ? new Date(data.logDate) : null;
    const logYear = logDate ? logDate.getUTCFullYear() : null;
    const logMonth = logDate ? logDate.getUTCMonth() + 1 : null;

    const updatedAnalysis = await this.fapAnalysisService.update(
      data.analysisId,
      {
        status: data.status,
        message: data.message,
        analysis: data.analysis,
        fapRegen: Boolean(data.fapRegen),
        logDate: logDate,
        logYear: logYear,
        logMonth: logMonth,
        distance: data.distance ?? data.analysis?.overall?.distance ?? null,
      },
    );
    const user = updatedAnalysis.user;
    if (user) {
      await this.averageService.update(user.id);
    }
  }

  @MessagePattern('average.result')
  async handleAverageResult(@Payload() data: AverageResultDto) {
    await this.fapAverageService.upsert(
      data.userId,
      data.type,
      {
        sha256: data.analysisSha,
        status: data.status,
        message: data.message,
        average: data.average,
      },
      data.year,
      data.month,
    );
  }
}
