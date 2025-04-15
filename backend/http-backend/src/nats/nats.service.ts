import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NatsService {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  async sendAnalysisRequest(data: {
    id: string;
    filePath: string;
  }): Promise<void> {
    await firstValueFrom(this.natsClient.emit('analyse.request', data));
  }
}
