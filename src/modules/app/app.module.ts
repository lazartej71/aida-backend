import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CalendarioAcademicoModule } from '../calendario-academico/calendario-academico.module.js';
import { CarrerasModule } from '../carreras/carreras.module.js';
import { ChatModule } from '../chat/chat.module.js';
import { DerivacionesModule } from '../derivaciones/derivaciones.module.js';
import { DocumentosModule } from '../documentos/documentos.module.js';
import { IngresoModule } from '../ingreso/ingreso.module.js';
import { InscripcionesModule } from '../inscripciones/inscripciones.module.js';
import { MateriasModule } from '../materias/materias.module.js';
import { MesasExamenModule } from '../mesas-examen/mesas-examen.module.js';
import { PreguntasFrecuentesModule } from '../preguntas-frecuentes/preguntas-frecuentes.module.js';
import { TramitesModule } from '../tramites/tramites.module.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    CalendarioAcademicoModule,
    CarrerasModule,
    ChatModule,
    DerivacionesModule,
    DocumentosModule,
    IngresoModule,
    InscripcionesModule,
    MateriasModule,
    MesasExamenModule,
    PreguntasFrecuentesModule,
    TramitesModule,
    UsuariosModule,
    // Observe ofrece trazas distribuidas, registros correlacionados, métricas
    // de peticiones y tareas, seguimiento de errores y alertas.
    // Para configurarlo, registrate en https://observe.nestjs.com y ejecutá
    // `npx @nestjs/observe link` para guardar tus claves en .env.
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'aida-backend',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
