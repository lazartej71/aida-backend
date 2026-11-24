import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import type { Evidencia } from '../../respuesta.js';
import {
  formatearFecha,
  hoyArgentina,
  mesMencionado,
  nombreDelMes,
  normalizar,
  similitud,
  terminos,
} from '../../../ia/embeddings/texto.js';

// Temas que el asistente sabe responder con datos exactos de la base
export type Tema =
  | 'carreras'
  | 'correlativas'
  | 'tramites'
  | 'suficiencias'
  | 'mesas'
  | 'inscripciones'
  | 'calendario'
  | 'ingreso';

// Resultado de la búsqueda:
// - tema: de qué trata la consulta (null si no se reconoció ninguno)
// - evidencias: los datos encontrados, con su documento de respaldo
// - aclaracion: una pregunta al estudiante cuando falta un dato (por ejemplo, la materia)
export interface ResultadoDatosExactos {
  tema: Tema | null;
  evidencias: Evidencia[];
  aclaracion?: string;
}

// Palabras clave de cada tema, revisadas en orden: gana la primera que coincide.
// Por ejemplo, "inscripción a mesas" es de mesas y "examen de ingreso" es de ingreso
const reglasDeTema: [Tema, RegExp][] = [
  ['correlativas', /correlativ/],
  [
    'tramites',
    /tramite|cambio de (plan|especialidad|comision)|baja de regularidad|fuera de termino|equivalencia|ampliacion de cupo|recursado|cursado simultaneo/,
  ],
  ['ingreso', /ingresante|\bingreso\b|seminario/],
  ['suficiencias', /suficiencia/],
  [
    'mesas',
    /\bmesas?\b|examen|\bfinal(es)?\b|\brendir\b|\brindo\b|\bturnos?\b/,
  ],
  ['inscripciones', /inscrib|inscripci|anotar/],
  [
    'calendario',
    /calendario|receso|vacaciones|\bclases\b|cuatrimestre|feriado|asueto|periodo lectivo/,
  ],
  ['carreras', /^(?!.*materia).*(\bcarreras?\b|oferta academica)/],
];

// Datos que la base no tiene (horarios, aulas, docentes, costos). Si la consulta
// pide alguno, no se responde con datos exactos: sigue a la búsqueda en documentos
const noDisponible =
  /\bcosto\b|\bprecio\b|\barancel\b|\btelefono\b|\bdireccion\b|\baula\b|\bdocente\b|\bprofesor\b|\bhorarios?\b|\bhora\b/;

// Palabras genéricas del calendario: no sirven para elegir un evento en particular
const palabrasDeCalendario = new Set(
  terminos(
    'calendario fecha fechas dia dias cuando empieza empiezan termina terminan hay proximo proxima academico',
  ),
);

// Fragmento común de una evidencia: de qué documento sale y su enlace
type ConDocumento = {
  documentoId: number | null;
  documento: { url: string | null } | null;
};
const respaldo = (dato: ConDocumento) => ({
  documentoId: dato.documentoId ?? undefined,
  url: dato.documento?.url,
});

// Un dato solo vale si su documento está vigente hoy (regla de negocio RN07)
type Vigencia = {
  documento: { vigenteDesde: Date | null; vigenteHasta: Date | null } | null;
};
const vigente = (dato: Vigencia) => {
  const doc = dato.documento;
  const hoy = hoyArgentina();
  return (
    !doc ||
    ((!doc.vigenteDesde || doc.vigenteDesde <= hoy) &&
      (!doc.vigenteHasta || doc.vigenteHasta >= hoy))
  );
};

// ¿El período (desde–hasta) toca el mes pedido? Sirve para "clases en diciembre",
// donde las clases empezaron en agosto pero siguen en diciembre
const cubreMes = (desde: Date, hasta: Date | null, mes: number) => {
  const fin = hasta ?? desde;
  for (
    let d = new Date(Date.UTC(desde.getUTCFullYear(), desde.getUTCMonth(), 1));
    d <= fin;
    d.setUTCMonth(d.getUTCMonth() + 1)
  )
    if (d.getUTCMonth() === mes) return true;
  return false;
};

@Injectable()
export class DatosExactosService {
  constructor(private readonly prisma: PrismaService) {}

  // Punto de entrada: reconoce el tema y delega en el método que lo resuelve
  async buscar(consulta: string): Promise<ResultadoDatosExactos> {
    const texto = normalizar(consulta);
    if (noDisponible.test(texto)) return { tema: null, evidencias: [] };
    const tema = reglasDeTema.find(([, regla]) => regla.test(texto))?.[0];
    if (!tema) return { tema: null, evidencias: [] };

    switch (tema) {
      case 'correlativas':
        return this.correlativas(consulta, texto);
      case 'tramites':
        return this.tramites(consulta);
      case 'suficiencias':
        return this.eventos(tema, consulta, 'SUFICIENCIA');
      case 'mesas':
        return this.mesas(consulta, texto);
      case 'inscripciones':
        return this.inscripciones();
      case 'ingreso':
        return this.ingreso();
      case 'calendario':
        return this.eventos(tema, consulta);
      case 'carreras':
        return this.carreras();
    }
  }

  // Busca la materia nombrada en la consulta. Si el nombre aparece completo gana;
  // si no, se usa la similitud de palabras. Ante un empate no elige ninguna
  private async materiaMencionada(consulta: string, texto: string) {
    const materias = await this.prisma.materia.findMany({
      include: { carrera: { select: { nombre: true, tipo: true } } },
    });
    const candidatas = materias
      .map((m) => ({
        m,
        puntaje: ` ${texto} `.includes(` ${normalizar(m.nombre)} `)
          ? 2
          : similitud(m.nombre, consulta),
      }))
      .filter((c) => c.puntaje >= 0.65)
      .sort((a, b) => b.puntaje - a.puntaje);
    const [primera, segunda] = candidatas;
    if (!primera || (segunda && segunda.puntaje === primera.puntaje))
      return null;
    return primera.m;
  }

  // Correlativas de una materia, para cursar y para rendir
  private async correlativas(
    consulta: string,
    texto: string,
  ): Promise<ResultadoDatosExactos> {
    const materia = await this.materiaMencionada(consulta, texto);
    if (!materia)
      return {
        tema: 'correlativas',
        evidencias: [],
        aclaracion:
          '¿De qué materia querés saber las correlativas? Por ejemplo: "correlativas de Física II".',
      };
    const relaciones = await this.prisma.correlatividad.findMany({
      where: { materiaId: materia.id },
      include: { requiere: true },
      orderBy: [{ para: 'asc' }, { requiereId: 'asc' }],
    });
    const titulo = `Correlatividades de ${materia.nombre} — ${materia.carrera.nombre}`;
    return {
      tema: 'correlativas',
      evidencias: [
        {
          id: `materia:${materia.id}`,
          titulo,
          texto: relaciones.length
            ? relaciones
                .map(
                  (r) =>
                    `Para ${r.para.toLowerCase()}: ${r.requiere.nombre}, condición ${r.condicion.toLowerCase()}.`,
                )
                .join('\n')
            : `${materia.nombre} no tiene correlativas: se puede cursar y rendir sin materias previas.`,
        },
      ],
    };
  }

  // Mesas de examen. Primero busca mesas cargadas para la materia nombrada;
  // si no hay, informa los próximos turnos oficiales, que valen para todas las materias
  private async mesas(
    consulta: string,
    texto: string,
  ): Promise<ResultadoDatosExactos> {
    const hoy = hoyArgentina();
    const mes = mesMencionado(consulta);
    const materia = await this.materiaMencionada(consulta, texto);
    const enElMes = (fecha: Date) =>
      mes === null || fecha.getUTCMonth() === mes;

    if (materia) {
      const propias = (
        await this.prisma.mesaExamen.findMany({
          where: { materiaId: materia.id, fecha: { gte: hoy } },
          include: { documento: true },
          orderBy: { fecha: 'asc' },
        })
      ).filter((m) => vigente(m) && enElMes(m.fecha));
      if (propias.length)
        return {
          tema: 'mesas',
          evidencias: propias.map((m) => ({
            id: `mesa:${m.id}`,
            titulo: `Mesa de ${materia.nombre}`,
            texto: `${materia.nombre}: ${formatearFecha(m.fecha)}, ${m.turno}° turno, mesa ${m.llamado}. Cierre de inscripción: ${formatearFecha(m.cierreInscripcion)}.`,
            ...respaldo(m),
          })),
        };
    }

    // Turnos generales del calendario. Hay dos calendarios oficiales con cierres de
    // inscripción distintos: carreras de grado y licenciaturas/tecnicaturas.
    // Si se nombró una materia, solo se muestra el de su tipo de carrera
    const grupoDe = (titulo: string) =>
      /licenciatura|tecnicatura/i.test(titulo)
        ? 'Licenciaturas y tecnicaturas'
        : 'Carreras de grado';
    const grupoDeLaMateria = materia
      ? materia.carrera.tipo === 'GRADO'
        ? 'Carreras de grado'
        : 'Licenciaturas y tecnicaturas'
      : null;
    const turnos = (
      await this.prisma.eventoAcademico.findMany({
        where: { tipo: 'EXAMENES', fechaDesde: { gte: hoy } },
        include: { documento: true },
        orderBy: { fechaDesde: 'asc' },
      })
    ).filter(
      (e) =>
        vigente(e) &&
        enElMes(e.fechaDesde) &&
        (!grupoDeLaMateria ||
          grupoDe(e.documento?.titulo ?? '') === grupoDeLaMateria),
    );
    if (!turnos.length) return { tema: 'mesas', evidencias: [] };

    // Las tres próximas mesas de cada calendario
    const grupos = new Map<string, typeof turnos>();
    for (const t of turnos) {
      const grupo = grupoDe(t.documento?.titulo ?? '');
      const lista = grupos.get(grupo) ?? [];
      if (lista.length < 3) grupos.set(grupo, [...lista, t]);
    }
    const aclaracionMateria = materia
      ? `No hay una mesa específica cargada para ${materia.nombre}: se rinde en los turnos generales.\n`
      : '';
    const encabezado =
      mes === null
        ? 'Próximas mesas de examen (valen para todas las materias):'
        : `Mesas de examen de ${nombreDelMes(mes)} (valen para todas las materias):`;
    const detalle = [...grupos]
      .map(
        ([grupo, lista]) =>
          `${grupos.size > 1 ? `${grupo}:\n` : ''}${lista
            .map((t) => `${formatearFecha(t.fechaDesde)}: ${t.titulo}.`)
            .join('\n')}`,
      )
      .join('\n\n');
    return {
      tema: 'mesas',
      evidencias: [
        {
          id: 'turnos-examen',
          titulo: 'Turnos de exámenes finales — Calendario académico',
          texto: `${aclaracionMateria}${encabezado}\n${detalle}`,
          ...respaldo(turnos[0]),
        },
      ],
    };
  }

  // Períodos de inscripción al cursado. Si no hay ninguno abierto ni próximo,
  // lo dice y recuerda cuál fue el último, en lugar de derivar
  private async inscripciones(): Promise<ResultadoDatosExactos> {
    const hoy = hoyArgentina();
    const periodos = (
      await this.prisma.periodoInscripcion.findMany({
        include: { documento: true },
        orderBy: { fechaDesde: 'asc' },
      })
    ).filter(vigente);
    if (!periodos.length) return { tema: 'inscripciones', evidencias: [] };
    const vigentes = periodos.filter((p) => p.fechaHasta >= hoy);
    const linea = (p: (typeof periodos)[number]) =>
      `${p.descripcion}: del ${formatearFecha(p.fechaDesde)} al ${formatearFecha(p.fechaHasta)}.`;
    if (vigentes.length)
      return {
        tema: 'inscripciones',
        evidencias: [
          {
            id: 'inscripciones',
            titulo: 'Inscripciones al cursado',
            texto: vigentes.map(linea).join('\n'),
            ...respaldo(vigentes[0]),
          },
        ],
      };
    const ultimo = periodos[periodos.length - 1];
    return {
      tema: 'inscripciones',
      evidencias: [
        {
          id: 'inscripciones',
          titulo: 'Inscripciones al cursado',
          texto: `Ahora no hay una inscripción al cursado abierta. La última fue la ${linea(ultimo).charAt(0).toLowerCase()}${linea(ultimo).slice(1)}\nPara inscribirte a una mesa de examen, preguntame por las próximas mesas: cada una tiene su fecha de cierre de inscripción.`,
          ...respaldo(ultimo),
        },
      ],
    };
  }

  // Trámites académicos. Si la consulta nombra uno, muestra ese; si no, todos.
  // Para cada uno indica si el plazo está abierto, ya cerró o no tiene plazo
  private async tramites(consulta: string): Promise<ResultadoDatosExactos> {
    const hoy = hoyArgentina();
    const todos = (
      await this.prisma.tramite.findMany({
        include: { documento: true },
        orderBy: { plazoDesde: 'asc' },
      })
    ).filter(vigente);
    if (!todos.length) return { tema: 'tramites', evidencias: [] };
    // Palabras de la consulta además de "trámite": si las hay, se busca ese trámite puntual
    const especificas = terminos(consulta).filter((t) => t !== 'tramite');
    const elegidos = especificas.length
      ? todos.filter(
          (t) =>
            similitud(especificas.join(' '), `${t.nombre} ${t.descripcion}`) >=
            0.5,
        )
      : [];
    const lista = elegidos.length ? elegidos : todos;
    const estado = (t: (typeof todos)[number]) => {
      if (!t.plazoHasta) return 'Sin plazo fijo.';
      const rango = t.plazoDesde
        ? `del ${formatearFecha(t.plazoDesde)} al ${formatearFecha(t.plazoHasta)}`
        : `hasta el ${formatearFecha(t.plazoHasta)}`;
      if (t.plazoHasta < hoy)
        return `El plazo de este año ya cerró (fue ${rango}).`;
      if (t.plazoDesde && t.plazoDesde > hoy) return `Se presenta ${rango}.`;
      return `Plazo abierto: ${rango}.`;
    };
    return {
      tema: 'tramites',
      evidencias: lista.map((t) => ({
        id: `tramite:${t.id}`,
        titulo: t.nombre,
        texto: `${t.nombre}: ${t.descripcion}${t.oficina ? ` Oficina: ${t.oficina}.` : ''} ${estado(t)}`,
        ...respaldo(t),
      })),
    };
  }

  // Eventos del calendario académico (clases, recesos, feriados, suficiencias...).
  // Toma los que todavía no terminaron; si la consulta nombra un mes, los de ese mes;
  // y si nombra algo puntual ("cuatrimestre", "inglés"), primero los que coinciden
  private async eventos(
    tema: Tema,
    consulta: string,
    tipo?: 'SUFICIENCIA',
  ): Promise<ResultadoDatosExactos> {
    const hoy = hoyArgentina();
    const mes = mesMencionado(consulta);
    const pendientes = (
      await this.prisma.eventoAcademico.findMany({
        where: {
          ...(tipo ? { tipo } : { tipo: { not: 'EXAMENES' } }),
          OR: [
            { fechaHasta: { gte: hoy } },
            { fechaHasta: null, fechaDesde: { gte: hoy } },
          ],
        },
        include: { documento: true },
        orderBy: { fechaDesde: 'asc' },
      })
    ).filter(
      (e) =>
        vigente(e) &&
        (mes === null || cubreMes(e.fechaDesde, e.fechaHasta, mes)),
    );
    const especificas = terminos(consulta).filter(
      (t) => !palabrasDeCalendario.has(t),
    );
    const coinciden = especificas.length
      ? pendientes.filter((e) => similitud(especificas.join(' '), e.titulo) > 0)
      : [];
    const elegidos = (coinciden.length ? coinciden : pendientes).slice(0, 8);
    if (!elegidos.length) return { tema, evidencias: [] };
    return {
      tema,
      evidencias: elegidos.map((e) => ({
        id: `evento:${e.id}`,
        titulo: e.titulo,
        texto: `${e.titulo}: ${formatearFecha(e.fechaDesde)}${e.fechaHasta ? ` al ${formatearFecha(e.fechaHasta)}` : ''}.`,
        ...respaldo(e),
      })),
    };
  }

  // Información del ingreso (seminario, pruebas de suficiencia, documentación)
  private async ingreso(): Promise<ResultadoDatosExactos> {
    const hoy = hoyArgentina();
    const datos = await this.prisma.infoIngreso.findMany({
      where: {
        OR: [{ inscripcionHasta: null }, { inscripcionHasta: { gte: hoy } }],
      },
      orderBy: { id: 'desc' },
      take: 10,
    });
    return {
      tema: 'ingreso',
      evidencias: datos.map((d) => ({
        id: `ingreso:${d.id}`,
        titulo: d.titulo,
        texto: `${d.titulo}: ${d.descripcion}${d.inscripcionDesde ? ` Inscripción desde el ${formatearFecha(d.inscripcionDesde)}` : ''}${d.inscripcionHasta ? ` hasta el ${formatearFecha(d.inscripcionHasta)}.` : ''}`,
      })),
    };
  }

  // Carreras activas de la facultad
  private async carreras(): Promise<ResultadoDatosExactos> {
    const datos = await this.prisma.carrera.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' },
    });
    if (!datos.length) return { tema: 'carreras', evidencias: [] };
    return {
      tema: 'carreras',
      evidencias: [
        {
          id: 'carreras',
          titulo: 'Oferta académica registrada',
          texto: datos
            .map(
              (d) =>
                `${d.nombre} (${d.tipo.toLowerCase()})${d.duracionAnios ? `, ${d.duracionAnios} años` : ''}${d.plan ? `, plan ${d.plan}` : ''}.`,
            )
            .join('\n'),
        },
      ],
    };
  }
}
