import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExceptionsFilter } from './utils/filters/exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Request validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Accept only properties defined in the DTO
      transform: true, // Automatically transforms the payload into a class instance
      forbidNonWhitelisted: false, // If any un expected properties are included, it will throw error
    }),
  );

  app.useGlobalFilters(new ExceptionsFilter());

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;

  await app.listen(port);
}
bootstrap();
