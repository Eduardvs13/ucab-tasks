import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/** Inicializa la aplicación NestJS con documentación Swagger y validación global. */
export async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API de Notas')
    .setDescription('API para gestionar notas: CRUD, filtros y exportación')
    .setVersion('1.0')
    .addTag('notas')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Ignora propiedades no definidas en el DTO.
      forbidNonWhitelisted: true, // Lanza error si se envían propiedades inesperadas.
      transform: true, // Transforma el payload en instancias de DTO.
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
if (process.env.NODE_ENV !== 'test') {
  void bootstrap();
}
