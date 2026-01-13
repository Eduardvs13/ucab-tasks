import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/** Bootstraps the NestJS application with Swagger docs and global validation. */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Notes API')
    .setDescription('The notes API description')
    .setVersion('1.0')
    .addTag('notes')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Ignore properties not defined in the DTO.
      forbidNonWhitelisted: true, // Throw if unexpected properties are sent.
      transform: true, // Transform payloads into DTO instances.
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
