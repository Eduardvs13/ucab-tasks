import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Ignora y no incluye propiedades que no estén definidas en el DTO.
      forbidNonWhitelisted: true, // Lanza un error si se envían propiedades no permitidas.
      transform: true, // Transforma el payload a una instancia del DTO.
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
