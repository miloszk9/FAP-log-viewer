import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NatsService {
  private readonly logger = new Logger(NatsService.name);

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  async sendAnalysisRequest(data: { id: string }): Promise<void> {
    this.logger.log(`Sending analysis request for ${data.id}`);
    await firstValueFrom(this.natsClient.emit('analyse.request', data));
    this.logger.log(`Analysis request sent for ${data.id}`);
  }

  async sendAverageRequest(data: {
    id: string;
    analysis_sha: string;
    analysis: Record<string, any>[];
  }): Promise<void> {
    this.logger.log(`Sending average request for ${data.id}`);
    await firstValueFrom(this.natsClient.emit('average.request', data));
    this.logger.log(`Average request sent for ${data.id}`);
  }
}
