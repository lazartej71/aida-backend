import { Injectable } from '@nestjs/common';
import type { RespuestaAsistente } from '../../respuesta.js';
@Injectable()
export class AbstencionService {
  responder(): RespuestaAsistente {
    return {
      texto:
        'No encontré información oficial suficiente y vigente para responder con certeza. La consulta queda derivada al personal de la facultad para su revisión.',
      estrategia: 'ABSTENCION',
      fuentes: [],
      derivar: true,
      proveedor: 'LOCAL',
    };
  }
}
