import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { crearValidacion } from '../common/pipes/validacion.pipe.js';
export function configurarAplicacion(app: NestExpressApplication) {
  app.use(
    (
      _req: unknown,
      res: { setHeader: (key: string, value: string) => void },
      next: () => void,
    ) => {
      res.setHeader('Cache-Control', 'no-store');
      next();
    },
  );
  app.useGlobalPipes(crearValidacion());
  app.use(helmet());
  app.useBodyParser('json', { limit: '512kb' });
  const origenes = (
    process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173'
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origenes,
    allowedHeaders: ['content-type', 'authorization', 'x-conversacion-token'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  const config = new DocumentBuilder()
    .setTitle('AIda API')
    .setDescription(
      'Información institucional, conversaciones con evidencia y gestión autorizada.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config), {
    swaggerOptions: { persistAuthorization: false },
  });
}
