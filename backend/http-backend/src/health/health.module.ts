import { Module, forwardRef } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { DatabaseModule } from '../database/database.module';
import { NatsModule } from '../nats/nats.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TerminusModule,
    forwardRef(() => DatabaseModule),
    forwardRef(() => NatsModule),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
