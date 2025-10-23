import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NatsService {
  private readonly logger = new Logger(NatsService.name);

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  async sendAnalysisRequest(data: { fileName: string }): Promise<void> {
    this.logger.log(`Sending analysis request for ${data.fileName}`);
    this.logger.debug(`Analysis request data: ${JSON.stringify(data)}`);
    await firstValueFrom(this.natsClient.emit('analysis.request', data));
    this.logger.log(`Analysis request sent for ${data.fileName}`);
  }

  async sendAverageRequest(data: {
    userId: string;
    analysisSha: string;
    analysis: Record<string, any>[];
  }): Promise<void> {
    this.logger.log(`Sending average request for ${data.userId}`);
    this.logger.debug(`Average request data: ${JSON.stringify(data)}`);
    await firstValueFrom(this.natsClient.emit('average.request', data));
    this.logger.log(`Average request sent for ${data.userId}`);
  }
}
