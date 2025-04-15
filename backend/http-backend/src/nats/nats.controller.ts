import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FapAnalysisService } from '../database/services/fap-analysis.service';
import { AnalysisResultDto } from './dto/analysis-result.dto';

@Controller()
export class NatsController {
  constructor(private readonly fapAnalysisService: FapAnalysisService) {}

  @MessagePattern('analyse.result')
  async handleAnalysisResult(@Payload() data: AnalysisResultDto) {
    await this.fapAnalysisService.update(data.filename, {
      status: data.status,
      message: data.message,
      analysis: data.analysis,
    });
  }
}
