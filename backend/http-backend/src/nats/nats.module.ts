import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { NatsService } from './nats.service';
import { NatsController } from './nats.controller';
import { DatabaseModule } from '../database/database.module';
import { AverageModule } from '../average/average.module';

@Module({
  imports: [
    forwardRef(() => DatabaseModule),
    ClientsModule.registerAsync([
      {
        name: 'NATS_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.NATS,
          options: {
            servers: [
              configService.get<string>('nats.url') || 'nats://localhost:4222',
            ],
          },
        }),
        inject: [ConfigService],
      },
    ]),
    forwardRef(() => AverageModule),
  ],
  controllers: [NatsController],
  providers: [NatsService],
  exports: [NatsService],
})
export class NatsModule {}
