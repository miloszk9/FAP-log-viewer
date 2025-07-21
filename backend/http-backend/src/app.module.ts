import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnalysisModule } from './analysis/analysis.module';
import { AuthModule } from './auth/auth.module';
import { AverageModule } from './average/average.module';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { HealthModule } from './health/health.module';
import { NatsModule } from './nats/nats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? 'production.env'
          : 'development.env',
      load: [configuration],
      isGlobal: true,
    }),
    AnalysisModule,
    AuthModule,
    AverageModule,
    DatabaseModule,
    EmailModule,
    NatsModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
