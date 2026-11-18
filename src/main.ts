import { NestFactory } from '@nestjs/core';
import { crearValidacion } from './common/pipes/validacion.pipe.js';
import { AppModule, ObserveInstrument } from './modules/app/app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // Todas las solicitudes se validan con su DTO antes de llegar al controlador
  app.useGlobalPipes(crearValidacion());

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
