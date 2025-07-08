import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as AdmZip from 'adm-zip';
import { Readable } from 'stream';
import { FapAnalysis } from 'src/database/entities/fap-analysis.entity';
import { FapAnalysisService } from 'src/database/services/fap-analysis.service';
import { NatsService } from '../nats/nats.service';

@Injectable()
export class AnalysisService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AnalysisService.name);
  private readonly uploadDir: string;
  private readonly dataAnalyserVersion: string;

  constructor(
    private readonly fapAnalysisService: FapAnalysisService,
    private readonly natsService: NatsService,
    private readonly configService: ConfigService,
  ) {
    this.uploadDir =
      this.configService.get<string>('app.uploadDir') || 'uploads';
    this.dataAnalyserVersion =
      this.configService.get<string>('dataAnalyser.version') || '';
    // Ensure upload directory exists
    fs.mkdir(this.uploadDir, { recursive: true }).catch(() => {});
  }

  async onApplicationBootstrap() {
    this.logger.log(
      `Checking if all analyses are up to date. Current version: ${this.dataAnalyserVersion}`,
    );
    const analyses = await this.fapAnalysisService.findAll();
    for (const analysis of analyses) {
      if (analysis.status === 'Success') {
        const version = analysis.version;
        if (version !== this.dataAnalyserVersion) {
          this.logger.log(
            `Analysis ${analysis.id} is not up to date. Current version: ${version}, required version: ${this.dataAnalyserVersion}`,
          );
          await this.fapAnalysisService.update(analysis.id, {
            status: 'pending',
            message: 'Analysis pending',
          });
          await this.natsService.sendAnalysisRequest({ id: analysis.id });
        }
      }
    }
  }

  private async processZipFile(
    file: Express.Multer.File,
    userId?: string,
  ): Promise<string[]> {
    const zip = new AdmZip(Buffer.from(file.buffer));
    const zipEntries = zip.getEntries();

    // Check if all files are CSV
    const nonCsvFiles = zipEntries.filter(
      (entry) => !entry.entryName.toLowerCase().endsWith('.csv'),
    );
    if (nonCsvFiles.length > 0) {
      throw new BadRequestException('ZIP file must contain only CSV files');
    }

    const analysisIds: string[] = [];

    // Process each CSV file
    for (const entry of zipEntries) {
      if (entry.entryName.toLowerCase().endsWith('.csv')) {
        const csvBuffer = entry.getData();
        const csvFile: Express.Multer.File = {
          buffer: csvBuffer,
          originalname: entry.entryName,
          fieldname: 'file',
          encoding: '7bit',
          mimetype: 'text/csv',
          size: csvBuffer.length,
          destination: '',
          filename: '',
          path: '',
          stream: Readable.from(Buffer.from(csvBuffer)),
        };

        const id = await this.saveCsvFile(csvFile, userId);
        analysisIds.push(id);
      }
    }

    return analysisIds;
  }

  private async saveCsvFile(
    file: Express.Multer.File,
    userId?: string,
  ): Promise<string> {
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

  async saveFile(
    file: Express.Multer.File,
    userId?: string,
  ): Promise<string | string[]> {
    if (file.originalname.toLowerCase().endsWith('.zip')) {
      return this.processZipFile(file, userId);
    } else {
      return this.saveCsvFile(file, userId);
    }
  }

  async getAnalysis(
    id: string,
    userId?: string,
  ): Promise<{
    fileName: string;
    status: string;
    message: string;
    result: any;
    regen: boolean;
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
      regen: analysis.regen,
    };
  }

  async getAnalysisForUser(userId: string): Promise<FapAnalysis[]> {
    return this.fapAnalysisService.findAllByUserId(userId);
  }
}
