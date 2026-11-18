import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './modules/app/app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // Valida el cuerpo de cada solicitud con las reglas de su DTO antes de llegar al controlador.
  // whitelist descarta los campos que el DTO no declara y forbidNonWhitelisted
  // responde con un error si llegan, para que no pasen datos inesperados
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
