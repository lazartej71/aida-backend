import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Module } from '@nestjs/common';
import { AsistenteService } from './asistente.service.js';
import { DatosExactosService } from './estrategias/datos-exactos/datos-exactos.service.js';
import { RecuperacionDocumentalService } from './estrategias/recuperacion-documental/recuperacion-documental.service.js';
import { ConversacionService } from './estrategias/conversacion/conversacion.service.js';
import { AbstencionService } from './estrategias/abstencion/abstencion.service.js';
import { IaModule } from '../ia/ia.module.js';
import { IaService } from '../ia/ia.service.js';
import { Roles } from '../auth/acceso.decorator.js';
@ApiBearerAuth()
@ApiTags('asistente')
@Controller('asistente')
@Roles('PERSONAL', 'ADMIN')
class AsistenteController {
  constructor(private readonly ia: IaService) {}
  @Get('estado') estado() {
    return {
      estrategias: [
        'CONVERSACION',
        'DATOS_EXACTOS',
        'RECUPERACION_DOCUMENTAL',
        'ABSTENCION',
      ],
      ...this.ia.estado(),
    };
  }
}
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
