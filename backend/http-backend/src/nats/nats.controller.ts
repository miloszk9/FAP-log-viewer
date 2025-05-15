import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FapAnalysisService } from '../database/services/fap-analysis.service';
import { AnalysisResultDto } from './dto/analysis-result.dto';
import { AverageResultDto } from './dto/average-result.dto';
import { FapAverageService } from 'src/database/services/fap-average.service';

@Controller()
export class NatsController {
  constructor(
    private readonly fapAnalysisService: FapAnalysisService,
    private readonly fapAverageService: FapAverageService,
  ) {}

  @MessagePattern('analyse.result')
  async handleAnalysisResult(@Payload() data: AnalysisResultDto) {
    await this.fapAnalysisService.update(data.id, {
      status: data.status,
      message: data.message,
      analysis: data.analysis,
    });
  }

  @MessagePattern('average.result')
  async handleAverageResult(@Payload() data: AverageResultDto) {
    await this.fapAverageService.update(data.id, {
      sha256: data.analysisSha,
      status: data.status,
      message: data.message,
      average: data.average,
    });
  }
}
