import { Module, forwardRef } from '@nestjs/common';
import { AverageService } from './average.service';
import { DatabaseModule } from '../database/database.module';
import { NatsModule } from '../nats/nats.module';
import { AverageController } from './average.controller';

@Module({
  imports: [forwardRef(() => DatabaseModule), forwardRef(() => NatsModule)],
  controllers: [AverageController],
  providers: [AverageService],
  exports: [AverageService],
})
export class AverageModule {}
