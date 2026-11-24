import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { normalizar } from '../ia/embeddings/texto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
@Injectable()
export class MetricasService {
  constructor(private readonly prisma: PrismaService) {}
  async resumen(dias: number) {
    const desde = new Date(Date.now() - dias * 86400000);
    const where = { creadoEn: { gte: desde } };
    const [
      conversaciones,
      mensajes,
      pendientes,
      estrategias,
      rendimiento,
      consultas,
    ] = await Promise.all([
      this.prisma.conversacion.count({ where: { iniciadaEn: { gte: desde } } }),
      this.prisma.mensaje.count({ where: { enviadoEn: { gte: desde } } }),
      this.prisma.derivacion.count({ where: { estado: { not: 'RESUELTA' } } }),
      this.prisma.consultaAsistente.groupBy({
        by: ['estrategia'],
        where,
        _count: { _all: true },
      }),
      this.prisma.consultaAsistente.aggregate({
        where,
        _avg: { duracionMs: true },
        _max: { duracionMs: true },
        _sum: { tokensEntrada: true, tokensSalida: true },
        _count: { _all: true },
      }),
      this.prisma.consultaAsistente.findMany({
        where,
        orderBy: { id: 'desc' },
        take: 5000,
        select: { consulta: true, estrategia: true },
      }),
    ]);
    const frecuencia = new Map<
      string,
      { consulta: string; cantidad: number; sinRespuesta: number }
    >();
    for (const c of consultas) {
      const clave = normalizar(c.consulta);
      const dato = frecuencia.get(clave) ?? {
        consulta: c.consulta,
        cantidad: 0,
        sinRespuesta: 0,
      };
      dato.cantidad++;
      if (c.estrategia === 'ABSTENCION') dato.sinRespuesta++;
      frecuencia.set(clave, dato);
    }
    return {
      periodo: { desde, dias },
      conversaciones,
      mensajes,
      derivacionesPendientes: pendientes,
      estrategias,
      rendimiento,
      preguntasFrecuentes: [...frecuencia.values()]
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 20),
      muestraFrecuencias: consultas.length,
      limiteMuestra: 5000,
      costoEstimado: null,
    };
  }
  async consultas(query: ListadoDto) {
    const where = query.busqueda
      ? { consulta: { contains: query.busqueda, mode: 'insensitive' as const } }
      : {};
    const [datos, total] = await this.prisma.$transaction([
      this.prisma.consultaAsistente.findMany({
        where,
        orderBy: { id: 'desc' },
        skip: (query.pagina - 1) * query.limite,
        take: query.limite,
      }),
      this.prisma.consultaAsistente.count({ where }),
    ]);
    return { datos, total, pagina: query.pagina, limite: query.limite };
  }
}
