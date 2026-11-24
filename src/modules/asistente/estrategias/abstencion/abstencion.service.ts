import { Injectable } from '@nestjs/common';
import type { RespuestaAsistente } from '../../respuesta.js';

// Estrategia de abstención (regla de negocio RN09): si no hay evidencia oficial,
// AIda no inventa una respuesta. Avisa y pide derivar la consulta al personal
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
