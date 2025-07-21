import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  MicroserviceHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private microservice: MicroserviceHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get('liveness')
  @HealthCheck()
  async liveness(): Promise<HealthCheckResult> {
    return await this.health.check([]);
  }

  @Get('readiness')
  @HealthCheck()
  readiness(): Promise<HealthCheckResult> {
    const natsUrl =
      this.configService.get<string>('nats.url') || 'nats://localhost:4222';
    return this.health.check([
      () => this.db.pingCheck('postgres'),
      () =>
        this.microservice.pingCheck('nats', {
          transport: Transport.NATS,
          options: { servers: [natsUrl] },
        }),
    ]);
  }
}
