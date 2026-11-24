import { Injectable } from '@nestjs/common';
import { DatosExactosService } from './estrategias/datos-exactos/datos-exactos.service.js';
import type { Tema } from './estrategias/datos-exactos/datos-exactos.service.js';
import { RecuperacionDocumentalService } from './estrategias/recuperacion-documental/recuperacion-documental.service.js';
import { AbstencionService } from './estrategias/abstencion/abstencion.service.js';
import { ConversacionService } from './estrategias/conversacion/conversacion.service.js';
import { IaService } from '../ia/ia.service.js';
import { terminos } from '../ia/embeddings/texto.js';
import type { Evidencia, RespuestaAsistente } from './respuesta.js';

// Si la consulta es de un tema conocido, un documento solo sirve como respuesta
// si habla de ese tema. Evita, por ejemplo, contestar una consulta de mesas de
// Análisis Matemático I con la lista de materias de primer año
const palabrasDelTema: Record<Tema, string[]> = {
  carreras: ['carrera'],
  correlativas: ['correlativa', 'correlatividad'],
  tramites: ['tramite', 'plazo', 'nota'],
  suficiencias: ['suficiencia'],
  mesas: ['mesa', 'examen', 'turno'],
  inscripciones: ['inscripcion'],
  calendario: ['clase', 'cuatrimestre', 'receso', 'feriado', 'calendario'],
  ingreso: ['ingreso', 'seminario', 'ingresante'],
};
const hablaDelTema = (evidencia: Evidencia, tema: Tema) => {
  const palabras = new Set(terminos(`${evidencia.titulo} ${evidencia.texto}`));
  return palabrasDelTema[tema].some((p) => palabras.has(p));
};

// Coordina las estrategias del asistente, en este orden:
// 1. Conversación: saludos, agradecimientos y pedidos de ayuda (no deriva).
// 2. Datos exactos: fechas, correlativas, trámites… salen de la base y citan su documento.
// 3. Recuperación documental: preguntas frecuentes y texto de los documentos oficiales.
// 4. Abstención: si no hay evidencia, no inventa y deriva la consulta al personal.
@Injectable()
export class AsistenteService {
  constructor(
    private readonly conversacion: ConversacionService,
    private readonly exactos: DatosExactosService,
    private readonly documentos: RecuperacionDocumentalService,
    private readonly abstencion: AbstencionService,
    private readonly ia: IaService,
  ) {}

  async responder(consulta: string): Promise<RespuestaAsistente> {
    // 1. Conversación
    const cortesia = this.conversacion.responder(consulta);
    if (cortesia) return cortesia;

    // 2. Datos exactos
    const { tema, evidencias, aclaracion } =
      await this.exactos.buscar(consulta);
    if (evidencias.length)
      return {
        texto: evidencias.map((e) => e.texto).join('\n\n'),
        estrategia: 'DATOS_EXACTOS',
        fuentes: evidencias,
        derivar: false,
        proveedor: 'LOCAL',
      };
    // Falta un dato para responder (por ejemplo, la materia): se pregunta en lugar de derivar
    if (aclaracion) return this.conversacion.respuesta(aclaracion);

    // 3. Recuperación documental (si se reconoció un tema, solo documentos de ese tema)
    const documentos = (await this.documentos.buscar(consulta)).filter(
      (d) => !tema || hablaDelTema(d, tema),
    );
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

    // 4. Abstención
    return this.abstencion.responder();
  }
}
