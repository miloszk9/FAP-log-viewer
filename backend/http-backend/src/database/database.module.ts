import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FapAnalysis } from './entities/fap-analysis.entity';
import { FapAnalysisService } from './services/fap-analysis.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres' as const,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'fap_analysis',
      entities: [FapAnalysis],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([FapAnalysis]),
  ],
  providers: [FapAnalysisService],
  exports: [FapAnalysisService],
})
export class DatabaseModule {}
