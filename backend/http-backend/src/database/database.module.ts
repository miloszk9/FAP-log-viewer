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
        const isProduction =
          configService.get('app.environment') === 'production';

        return {
          type: 'postgres' as const,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.name,
          entities: [FapAnalysis],
          synchronize: !isProduction, // Disable in production
          migrations: ['dist/migrations/sql/*.js'],
          migrationsRun: isProduction, // Run migrations automatically in production
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
