import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AnalysisModule } from './analysis/analysis.module';
import { NatsModule } from './nats/nats.module';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';

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
    DatabaseModule,
    AnalysisModule,
    NatsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
