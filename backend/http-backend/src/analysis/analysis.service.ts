import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';
import { FapAnalysisService } from 'src/database/services/fap-analysis.service';
import { NatsService } from '../nats/nats.service';

@Injectable()
export class AnalysisService {
  private readonly uploadDir: string;

  constructor(
    private readonly fapAnalysisService: FapAnalysisService,
    private readonly natsService: NatsService,
    private readonly configService: ConfigService,
  ) {
    this.uploadDir =
      this.configService.get<string>('app.uploadDir') || 'uploads';
    // Ensure upload directory exists
    fs.mkdir(this.uploadDir, { recursive: true }).catch(() => {});
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const id = uuidv4();
    const filePath = path.join(this.uploadDir, `${id}.csv`);

    await fs.writeFile(filePath, Buffer.from(file.buffer));

    const sha256 = createHash('sha256')
      .update(Buffer.from(file.buffer))
      .digest('hex');

    await this.fapAnalysisService.create({
      id,
      stage: 'pending',
      status: 'pending',
      message: 'Analysis pending',
      sha256,
      analysis: {},
    });

    // Schedule analysis process via NATS
    await this.natsService.sendAnalysisRequest({ id, filePath });

    return id;
  }

  async getAnalysis(
    id: string,
  ): Promise<{ status: string; message: string; analysis?: any }> {
    const analysis = await this.fapAnalysisService.findOne(id);
    if (!analysis) {
      throw new NotFoundException('Analysis for given ID not found.');
    }
    return {
      status: analysis.status,
      message: analysis.message,
      analysis: analysis.analysis,
    };
  }
}
