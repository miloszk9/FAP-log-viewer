import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { EmailController } from './email.controller';
import { AnalysisService } from './analysis.service';
import { DatabaseModule } from '../database/database.module';
import { NatsModule } from '../nats/nats.module';

@Module({
  imports: [DatabaseModule, NatsModule],
  controllers: [AnalysisController, EmailController],
  providers: [AnalysisService],
})
export class AnalysisModule {}
