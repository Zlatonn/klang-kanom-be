import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResponseInterceptor } from './utils/interceptors/response.interceptor';
import { ExceptionsFilter } from './utils/filters/exceptions.filter';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // enable cors allows request from another domain
  app.enableCors();

  // using helmet for security
  app.use(helmet({ contentSecurityPolicy: false }));

  // request validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // automatically transforms the payload into a class instance
      whitelist: true, // accept only properties defined in the DTO
      forbidNonWhitelisted: true, // if any un expected properties are included, it will throw error
    }),
  );

  // using global interceptor, filter
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new ExceptionsFilter());

  // set global prefix & set dafault versioning
  app.setGlobalPrefix('klang-kanom-backend/api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // swagger Config
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Klang Kanom Backend')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // create swagger document
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);

  // create swagger endpoint
  SwaggerModule.setup('docs', app, documentFactory);

  const configService = app.get(ConfigService);

  const port = configService.get('PORT') || 3000;

  await app.listen(port);
}

bootstrap();
