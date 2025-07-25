import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AnalysisModule } from './analysis/analysis.module';
import { NatsModule } from './nats/nats.module';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { AverageModule } from './average/average.module';
import { EmailModule } from './email/email.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
