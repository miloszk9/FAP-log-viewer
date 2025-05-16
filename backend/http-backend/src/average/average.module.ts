import { Module, forwardRef } from '@nestjs/common';
import { AverageService } from './average.service';
import { DatabaseModule } from '../database/database.module';
import { NatsModule } from '../nats/nats.module';

@Module({
  imports: [forwardRef(() => DatabaseModule), forwardRef(() => NatsModule)],
  providers: [AverageService],
  exports: [AverageService],
})
export class AverageModule {}
