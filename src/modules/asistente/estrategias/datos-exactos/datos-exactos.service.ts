import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import type { Evidencia } from '../../respuesta.js';
import {
  hoyArgentina,
  normalizar,
  similitud,
  terminos,
} from '../../../ia/embeddings/texto.js';

@Injectable()
export class DatosExactosService {
  constructor(private readonly prisma: PrismaService) {}
  async buscar(consulta: string): Promise<Evidencia[]> {
    const texto = normalizar(consulta);
    const hoy = hoyArgentina();
    if (
      /\bcosto\b|\bprecio\b|\barancel\b|\btelefono\b|\bdireccion\b|\baula\b|\bdocente\b|\bprofesor\b|\bhorarios?\b|\bhora\b/.test(
        texto,
      )
    )
      return [];
    const anioSolicitado = texto.match(/\b(20\d{2})\b/)?.[1];
    const vigente = (
      d: { vigenteDesde: Date | null; vigenteHasta: Date | null } | null,
    ) =>
      !d ||
      ((!d.vigenteDesde || d.vigenteDesde <= hoy) &&
        (!d.vigenteHasta || d.vigenteHasta >= hoy));
    if (
      /\bcarreras?\b|\boferta academica\b/.test(texto) &&
      !/materia|correlativ/.test(texto)
    ) {
      const datos = await this.prisma.carrera.findMany({
        where: { activa: true },
        orderBy: { nombre: 'asc' },
        take: 100,
      });
      return datos.length
        ? [
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
          ]
        : [];
    }
    if (/correlativ|\bmesas?\b|\bexamen/.test(texto)) {
      const materias = await this.prisma.materia.findMany({
        take: 1000,
        include: { carrera: { select: { nombre: true } } },
      });
      const candidatas = materias
        .map((m) => ({
          m,
          score: ` ${texto} `.includes(` ${normalizar(m.nombre)} `)
            ? 2
            : similitud(m.nombre, consulta),
        }))
        .filter((x) => x.score >= 0.65)
        .sort((a, b) => b.score - a.score);
      const materia =
        candidatas[0] &&
        (!candidatas[1] || candidatas[0].score > candidatas[1].score)
          ? candidatas[0].m
          : null;
      const genericos = new Set([
        'mesa',
        'mesas',
        'examen',
        'examenes',
        'fecha',
        'fechas',
        'proxima',
        'proximas',
        'proximo',
        'proximos',
        'rendir',
        'turno',
        'turnos',
        'inscripcion',
        'inscripciones',
      ]);
      if (
        !materia &&
        terminos(consulta).some(
          (t) => !genericos.has(t) && !/^20\d{2}$/.test(t),
        )
      )
        return [];
      if (/correlativ/.test(texto)) {
        if (!materia) return [];
        const relaciones = await this.prisma.correlatividad.findMany({
          where: { materiaId: materia.id },
          include: { requiere: true },
          orderBy: { requiereId: 'asc' },
        });
        if (!relaciones.length) return [];
        return [
          {
            id: `materia:${materia.id}`,
            titulo: `Correlatividades de ${materia.nombre} — ${materia.carrera.nombre}`,
            texto: relaciones
              .map(
                (r) =>
                  `Para ${r.para.toLowerCase()}: ${r.requiere.nombre}, condición ${r.condicion.toLowerCase()}.`,
              )
              .join('\n'),
          },
        ];
      }
      const mesas = await this.prisma.mesaExamen.findMany({
        where: {
          fecha: {
            gte:
              anioSolicitado && new Date(`${anioSolicitado}-01-01`) > hoy
                ? new Date(`${anioSolicitado}-01-01`)
                : hoy,
            ...(anioSolicitado
              ? { lt: new Date(`${Number(anioSolicitado) + 1}-01-01`) }
              : {}),
          },
          ...(materia ? { materiaId: materia.id } : {}),
        },
        include: { materia: true, documento: true },
        orderBy: { fecha: 'asc' },
        take: 10,
      });
      return mesas
        .filter((m) => vigente(m.documento))
        .map((m) => ({
          id: `mesa:${m.id}`,
          titulo: `Mesa de ${m.materia.nombre}`,
          texto: `${m.materia.nombre}: ${m.fecha.toISOString().slice(0, 10)}, turno ${m.turno}, llamado ${m.llamado}. Cierre de inscripción: ${m.cierreInscripcion.toISOString().slice(0, 10)}.`,
          documentoId: m.documentoId ?? undefined,
          url: m.documento?.url,
        }));
    }
    if (/inscripci/.test(texto) && !/ingreso/.test(texto)) {
      const datos = await this.prisma.periodoInscripcion.findMany({
        where: { fechaHasta: { gte: hoy } },
        include: { documento: true },
        orderBy: { fechaDesde: 'asc' },
        take: 10,
      });
      return datos
        .filter((d) => vigente(d.documento))
        .map((d) => ({
          id: `inscripcion:${d.id}`,
          titulo: d.descripcion,
          texto: `${d.descripcion}: desde ${d.fechaDesde.toISOString().slice(0, 10)} hasta ${d.fechaHasta.toISOString().slice(0, 10)}${d.nivel ? `, nivel ${d.nivel}` : ''}.`,
          documentoId: d.documentoId ?? undefined,
          url: d.documento?.url,
        }));
    }
    if (/calendario|receso|\bclases\b/.test(texto)) {
      const datos = await this.prisma.eventoAcademico.findMany({
        where: {
          OR: [
            { fechaHasta: { gte: hoy } },
            { fechaHasta: null, fechaDesde: { gte: hoy } },
          ],
        },
        include: { documento: true },
        orderBy: { fechaDesde: 'asc' },
        take: 10,
      });
      return datos
        .filter((d) => vigente(d.documento))
        .map((d) => ({
          id: `evento:${d.id}`,
          titulo: d.titulo,
          texto: `${d.titulo}: ${d.fechaDesde.toISOString().slice(0, 10)}${d.fechaHasta ? ` a ${d.fechaHasta.toISOString().slice(0, 10)}` : ''}.`,
          documentoId: d.documentoId ?? undefined,
          url: d.documento?.url,
        }));
    }
    if (/ingresante|\bingreso\b|seminario/.test(texto)) {
      const datos = await this.prisma.infoIngreso.findMany({
        where: {
          OR: [{ inscripcionHasta: null }, { inscripcionHasta: { gte: hoy } }],
        },
        orderBy: { id: 'desc' },
        take: 10,
      });
      return datos.map((d) => ({
        id: `ingreso:${d.id}`,
        titulo: d.titulo,
        texto: `${d.titulo}: ${d.descripcion}${d.inscripcionDesde ? ` Inscripción desde ${d.inscripcionDesde.toISOString().slice(0, 10)}.` : ''}${d.inscripcionHasta ? ` Hasta ${d.inscripcionHasta.toISOString().slice(0, 10)}.` : ''}`,
      }));
    }
    return [];
  }
}
