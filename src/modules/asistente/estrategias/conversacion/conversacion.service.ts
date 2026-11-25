import { Injectable } from '@nestjs/common';
import type { RespuestaAsistente } from '../../respuesta.js';
import { normalizar } from '../../../ia/embeddings/texto.js';

// Lo que AIda sabe responder. Se muestra al saludar o cuando piden ayuda
export const TEMAS_DISPONIBLES =
  'Puedo responderte con información oficial de la UTN FRT sobre:\n' +
  '• mesas y turnos de examen, con sus cierres de inscripción;\n' +
  '• correlativas de una materia;\n' +
  '• inscripciones al cursado y trámites académicos;\n' +
  '• calendario: clases, recesos, feriados y pruebas de suficiencia;\n' +
  '• ingreso y carreras.\n' +
  'Por ejemplo: "¿Cuándo es el próximo turno de exámenes?" o "Correlativas de Física II".';

// Frases de cortesía. Solo cuentan si la consulta no trae nada más:
// "hola" es un saludo, pero "hola, ¿cuándo son las mesas?" es una consulta
const saludo =
  /^(hola|holis|buenas|buen dia|buenos dias|buenas tardes|buenas noches|que tal|hey)( aida)?$/;
const agradecimiento =
  /^(muchas )?(gracias|genial|perfecto|ok|okey|dale|listo|joya|barbaro)( aida)?$/;
const despedida = /^(chau|adios|hasta luego|nos vemos)( aida)?$/;
const ayuda =
  /^(ayuda|help|menu|que (podes|puedes|sabes) (hacer|responder)|que te puedo preguntar|que puedo (preguntar|consultar)|como funciona(s)?)$/;

// Estrategia de conversación: responde saludos, agradecimientos, despedidas y
// pedidos de ayuda sin buscar en la base y, sobre todo, sin crear una derivación
// (antes, un "hola" terminaba en la bandeja del personal)
@Injectable()
export class ConversacionService {
  responder(consulta: string): RespuestaAsistente | null {
    const texto = normalizar(consulta);
    if (saludo.test(texto))
      return this.respuesta(
        `¡Hola! Soy AIda, el asistente de la UTN FRT. ${TEMAS_DISPONIBLES}`,
      );
    if (ayuda.test(texto)) return this.respuesta(TEMAS_DISPONIBLES);
    if (agradecimiento.test(texto))
      return this.respuesta(
        '¡De nada! Si tenés otra consulta, escribila cuando quieras.',
      );
    if (despedida.test(texto))
      return this.respuesta('¡Hasta luego! Cuando necesites algo, acá estoy.');
    return null;
  }

  // También la usa el asistente para pedir un dato que falta (por ejemplo, la materia)
  respuesta(texto: string): RespuestaAsistente {
    return {
      texto,
      estrategia: 'CONVERSACION',
      fuentes: [],
      derivar: false,
      proveedor: 'LOCAL',
    };
  }
}
