import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;
  const natsUrl =
    configService.get<string>('nats.url') || 'nats://localhost:4222';

  // Enable validation for all incoming requests
  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS
  app.enableCors({
    origin: 'http://127.0.0.1:5173',
    credentials: true,
  });

  // Set global prefix for all routes, except for health and email routes
  app.setGlobalPrefix('/api/v1', {
    exclude: [
      { path: '/health/*path', method: RequestMethod.ALL },
      { path: '/email', method: RequestMethod.ALL },
    ],
  });

  app.connectMicroservice({
    transport: Transport.NATS,
    options: {
      servers: [natsUrl],
    },
  });

  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .setTitle('FAP Analysis API')
    .setDescription('API for analyzing FAP log files')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
}
void bootstrap();
