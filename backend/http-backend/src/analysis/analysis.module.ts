import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { DatabaseModule } from '../database/database.module';
import { NatsModule } from '../nats/nats.module';

@Module({
  imports: [DatabaseModule, NatsModule],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}
