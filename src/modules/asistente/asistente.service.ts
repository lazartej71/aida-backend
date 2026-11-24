import { Injectable } from '@nestjs/common';
import { DatosExactosService } from './estrategias/datos-exactos/datos-exactos.service.js';
import { RecuperacionDocumentalService } from './estrategias/recuperacion-documental/recuperacion-documental.service.js';
import { AbstencionService } from './estrategias/abstencion/abstencion.service.js';
import { IaService } from '../ia/ia.service.js';
import type { RespuestaAsistente } from './respuesta.js';
@Injectable()
export class AsistenteService {
  constructor(
    private readonly exactos: DatosExactosService,
    private readonly documentos: RecuperacionDocumentalService,
    private readonly abstencion: AbstencionService,
    private readonly ia: IaService,
  ) {}
  async responder(consulta: string): Promise<RespuestaAsistente> {
    const exactos = await this.exactos.buscar(consulta);
    if (exactos.length)
      return {
        texto: exactos.map((e) => e.texto).join('\n\n'),
        estrategia: 'DATOS_EXACTOS',
        fuentes: exactos,
        derivar: false,
        proveedor: 'LOCAL',
      };
    const documentos = await this.documentos.buscar(consulta);
    if (documentos.length) {
      const seleccion = await this.ia.seleccionar(consulta, documentos);
      return {
        texto: seleccion.evidencia.texto,
        estrategia: 'RECUPERACION_DOCUMENTAL',
        fuentes: [seleccion.evidencia],
        derivar: false,
        proveedor: seleccion.proveedor,
      };
    }
    return this.abstencion.responder();
  }
}
