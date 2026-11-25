import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePreguntasFrecuenteDto } from './dto/create-preguntas-frecuente.dto.js';
import { UpdatePreguntasFrecuenteDto } from './dto/update-preguntas-frecuente.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import { operacion, limpiarDatos } from '../../common/database/operaciones.js';

@Injectable()
export class PreguntasFrecuentesService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreatePreguntasFrecuenteDto) {
    const datos = limpiarDatos(dto);
    return operacion(() =>
      this.prisma.preguntaFrecuente.create({ data: datos }),
    );
  }
  async findAll(query: ListadoDto = new ListadoDto()) {
    const where = {
      ...(query.busqueda
        ? {
            OR: ['pregunta', 'respuesta', 'categoria'].map((campo) => ({
              [campo]: {
                contains: query.busqueda,
                mode: 'insensitive' as const,
              },
            })),
          }
        : {}),
      ...(query.categoria !== undefined ? { categoria: query.categoria } : {}),
    };
    const [datos, total] = await operacion(() =>
      this.prisma.$transaction([
        this.prisma.preguntaFrecuente.findMany({
          where,
          orderBy: { id: 'asc' },
          skip: (query.pagina - 1) * query.limite,
          take: query.limite,
        }),
        this.prisma.preguntaFrecuente.count({ where }),
      ]),
    );
    return { datos, total, pagina: query.pagina, limite: query.limite };
  }
  async findOne(id: number) {
    const dato = await operacion(() =>
      this.prisma.preguntaFrecuente.findUnique({ where: { id } }),
    );
    if (!dato) throw new NotFoundException('El registro no existe.');
    return dato;
  }
  async update(id: number, dto: UpdatePreguntasFrecuenteDto) {
    // Si el registro no existe, findOne responde 404 antes de intentar actualizar
    await this.findOne(id);
    const datos = limpiarDatos(dto);
    return operacion(() =>
      this.prisma.preguntaFrecuente.update({ where: { id }, data: datos }),
    );
  }
  remove(id: number) {
    return operacion(() =>
      this.prisma.preguntaFrecuente.delete({ where: { id } }),
    );
  }
}
