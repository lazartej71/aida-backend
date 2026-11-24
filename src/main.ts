import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './modules/app/app.module.js';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { configurarAplicacion } from './config/aplicacion.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
    rawBody: true,
  });

  configurarAplicacion(app);
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
