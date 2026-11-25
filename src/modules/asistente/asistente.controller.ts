import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { IaService } from '../ia/ia.service.js';

// Estado del asistente: qué estrategias usa y si hay un proveedor de IA configurado.
// Solo para el personal; las consultas de los estudiantes entran por /chat
@ApiBearerAuth()
@ApiTags('asistente')
@Controller('asistente')
@Roles('PERSONAL', 'ADMIN')
export class AsistenteController {
  constructor(private readonly ia: IaService) {}

  @Get('estado')
  estado() {
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
