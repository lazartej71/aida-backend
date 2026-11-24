import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import type { Evidencia } from '../../respuesta.js';
import {
  hoyArgentina,
  similitud,
  terminos,
} from '../../../ia/embeddings/texto.js';
@Injectable()
export class RecuperacionDocumentalService {
  constructor(private readonly prisma: PrismaService) {}
  async buscar(consulta: string): Promise<Evidencia[]> {
    const hoy = hoyArgentina();
    const vigencia = {
      OR: [
        { documentoId: null },
        {
          documento: {
            AND: [
              { OR: [{ vigenteDesde: null }, { vigenteDesde: { lte: hoy } }] },
              { OR: [{ vigenteHasta: null }, { vigenteHasta: { gte: hoy } }] },
            ],
          },
        },
      ],
    };
    const [preguntas, tramites] = await Promise.all([
      this.prisma.preguntaFrecuente.findMany({
        where: vigencia,
        include: { documento: true },
        take: 500,
      }),
      this.prisma.tramite.findMany({
        where: {
          ...vigencia,
          AND: [{ OR: [{ plazoHasta: null }, { plazoHasta: { gte: hoy } }] }],
        },
        include: { documento: true },
        take: 500,
      }),
    ]);
    const evidencias: Evidencia[] = preguntas.map((p) => ({
      id: `faq:${p.id}`,
      titulo: p.pregunta,
      texto: p.respuesta,
      documentoId: p.documentoId ?? undefined,
      url: p.documento?.url,
    }));
    evidencias.push(
      ...tramites.map((t) => ({
        id: `tramite:${t.id}`,
        titulo: t.nombre,
        texto: `${t.nombre}: ${t.descripcion}${t.oficina ? ` Oficina: ${t.oficina}.` : ''}${t.plazoHasta ? ` Plazo hasta ${t.plazoHasta.toISOString().slice(0, 10)}.` : ''}`,
        documentoId: t.documentoId ?? undefined,
        url: t.documento?.url,
      })),
    );
    const entrada = terminos(consulta).slice(0, 20);
    if (entrada.length) {
      const query = entrada.join(' | ');
      const fragmentos = await this.prisma.$queryRaw<
        {
          id: number;
          documentoId: number;
          titulo: string;
          url: string | null;
          contenido: string;
        }[]
      >`
    SELECT f.id, d.id AS "documentoId", d.titulo, d.url, f.contenido
    FROM fragmentos_documento f JOIN versiones_documento v ON v.id=f.version_id JOIN documentos d ON d.id=v.documento_id
    WHERE v.numero=d.version_actual AND (d.vigente_desde IS NULL OR d.vigente_desde<=${hoy}::date)
      AND (d.vigente_hasta IS NULL OR d.vigente_hasta>=${hoy}::date)
      AND to_tsvector('spanish',f.contenido) @@ to_tsquery('spanish',${query})
    ORDER BY ts_rank_cd(to_tsvector('spanish',f.contenido),to_tsquery('spanish',${query})) DESC LIMIT 10`;
      evidencias.push(
        ...fragmentos.map((f) => ({
          id: `fragmento:${f.id}`,
          titulo: f.titulo,
          texto: f.contenido,
          documentoId: f.documentoId,
          url: f.url,
        })),
      );
    }
    return evidencias
      .map((e) => ({ e, score: similitud(consulta, `${e.titulo} ${e.texto}`) }))
      .filter(
        (x) => x.score >= 0.5 && (entrada.length < 2 ? x.score === 1 : true),
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => x.e);
  }
}
