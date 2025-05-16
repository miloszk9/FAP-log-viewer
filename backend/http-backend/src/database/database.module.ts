import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FapAnalysis } from './entities/fap-analysis.entity';
import { User } from './entities/user.entity';
import { FapAnalysisService } from './services/fap-analysis.service';
import { UserService } from './services/user.service';
import { FapAverage } from './entities/fap-average.entity';
import { AverageModule } from '../average/average.module';
import { FapAverageService } from './services/fap-average.service';

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
          entities: [FapAnalysis, FapAverage, User],
          synchronize: !isProduction, // Disable in production
          migrations: ['dist/database/migrations/sql/*.js'],
          migrationsRun: isProduction, // Run migrations automatically in production
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([FapAnalysis, FapAverage, User]),
    forwardRef(() => AverageModule),
  ],
  providers: [FapAnalysisService, UserService, FapAverageService],
  exports: [FapAnalysisService, UserService, FapAverageService],
})
export class DatabaseModule {}
