import { Module } from '@nestjs/common';
import { AsistenteController } from './asistente.controller.js';
import { AsistenteService } from './asistente.service.js';
import { ConversacionService } from './estrategias/conversacion/conversacion.service.js';
import { DatosExactosService } from './estrategias/datos-exactos/datos-exactos.service.js';
import { RecuperacionDocumentalService } from './estrategias/recuperacion-documental/recuperacion-documental.service.js';
import { AbstencionService } from './estrategias/abstencion/abstencion.service.js';
import { IaModule } from '../ia/ia.module.js';

// El asistente y sus cuatro estrategias. Lo usa ChatModule para responder consultas
@Module({
  imports: [IaModule],
  providers: [
    AsistenteService,
    ConversacionService,
    DatosExactosService,
    RecuperacionDocumentalService,
    AbstencionService,
  ],
  controllers: [AsistenteController],
  exports: [AsistenteService],
})
export class AsistenteModule {}
