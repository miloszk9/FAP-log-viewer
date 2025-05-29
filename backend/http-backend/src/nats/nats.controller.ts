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

  @MessagePattern('analyse.result')
  async handleAnalysisResult(@Payload() data: AnalysisResultDto) {
    const updatedAnalysis = await this.fapAnalysisService.update(data.id, {
      status: data.status,
      message: data.message,
      analysis: data.analysis,
    });
    const user = updatedAnalysis.user;
    if (user) {
      await this.averageService.update(user.id);
    }
  }

  @MessagePattern('average.result')
  async handleAverageResult(@Payload() data: AverageResultDto) {
    await this.fapAverageService.update(data.id, {
      sha256: data.sha256,
      status: data.status,
      message: data.message,
      average: data.average,
    });
  }
}
