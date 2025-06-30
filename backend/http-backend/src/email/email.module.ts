import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { AnalysisModule } from '../analysis/analysis.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [HttpModule, DatabaseModule, forwardRef(() => AnalysisModule)],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
