import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FapAnalysis } from './entities/fap-analysis.entity';
import { FapAnalysisService } from './services/fap-analysis.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        return {
          type: 'postgres' as const,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.name,
          entities: [FapAnalysis],
          synchronize: true, // TODO: Remove in production
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([FapAnalysis]),
  ],
  providers: [FapAnalysisService],
  exports: [FapAnalysisService],
})
export class DatabaseModule {}
