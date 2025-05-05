import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { FapAnalysis } from 'src/database/entities/fap-analysis.entity';
import { FapAnalysisService } from 'src/database/services/fap-analysis.service';
import { NatsService } from '../nats/nats.service';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);
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

  async saveFile(file: Express.Multer.File, userId?: string): Promise<string> {
    const sha256 = createHash('sha256')
      .update(Buffer.from(file.buffer))
      .digest('hex');

    const existingAnalysis = await this.fapAnalysisService.findBySha256(sha256);
    let id: string;
    if (existingAnalysis) {
      id = existingAnalysis.id;
      if (existingAnalysis.status === 'Success') {
        return existingAnalysis.id;
      }
    } else {
      const newAnalysis = await this.fapAnalysisService.create({
        status: 'pending',
        message: 'Analysis pending',
        sha256,
        analysis: {},
        user: userId ? ({ id: userId } as any) : undefined,
        fileName: file.originalname,
      } as FapAnalysis);
      id = newAnalysis.id;
      const filePath = path.join(this.uploadDir, `${id}.csv`);

      this.logger.log(`Saving file ${file.originalname} to ${filePath}`);

      await fs.writeFile(filePath, Buffer.from(file.buffer));
    }

    this.logger.log(`Sending NATS analysis request for ${id}`);
    await this.natsService.sendAnalysisRequest({ id });

    return id;
  }

  async getAnalysis(
    id: string,
    userId?: string,
  ): Promise<{
    fileName: string;
    status: string;
    message: string;
    result: any;
  }> {
    const analysis = await this.fapAnalysisService.findOne(id);
    if (!analysis) {
      this.logger.log(`FapAnalysis ${id} not found`);
      throw new NotFoundException('Analysis for given ID not found.');
    }

    // If analysis has a user and it doesn't match the requesting user, return not found
    if (analysis.user && analysis.user.id !== userId) {
      this.logger.warn(`Denied access to FapAnalysis ${id} for user ${userId}`);
      throw new NotFoundException('Analysis for given ID not found.');
    }

    return {
      fileName: analysis.fileName,
      status: analysis.status,
      message: analysis.message,
      result: analysis.analysis,
    };
  }
}
