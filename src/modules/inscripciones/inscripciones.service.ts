import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateInscripcioneDto } from './dto/create-inscripcione.dto.js';
import { UpdateInscripcioneDto } from './dto/update-inscripcione.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import {
  operacion,
  convertirFechas,
  validarRangos,
} from '../../common/database/operaciones.js';

@Injectable()
export class InscripcionesService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateInscripcioneDto) {
    const datos = convertirFechas(dto, ['fechaDesde', 'fechaHasta'] as const);
    validarRangos(datos, [['fechaDesde', 'fechaHasta']]);
    return operacion(() =>
      this.prisma.periodoInscripcion.create({ data: datos }),
    );
  }
  async findAll(query: ListadoDto = new ListadoDto()) {
    const where = {
      ...(query.busqueda
        ? {
            OR: ['descripcion'].map((campo) => ({
              [campo]: {
                contains: query.busqueda,
                mode: 'insensitive' as const,
              },
            })),
          }
        : {}),
      ...(query.tipo !== undefined ? { tipo: query.tipo } : {}),
    };
    const [datos, total] = await operacion(() =>
      this.prisma.$transaction([
        this.prisma.periodoInscripcion.findMany({
          where,
          orderBy: { id: 'asc' },
          skip: (query.pagina - 1) * query.limite,
          take: query.limite,
        }),
        this.prisma.periodoInscripcion.count({ where }),
      ]),
    );
    return { datos, total, pagina: query.pagina, limite: query.limite };
  }
  async findOne(id: number) {
    const dato = await operacion(() =>
      this.prisma.periodoInscripcion.findUnique({ where: { id } }),
    );
    if (!dato) throw new NotFoundException('El registro no existe.');
    return dato;
  }
  async update(id: number, dto: UpdateInscripcioneDto) {
    const actual = await this.findOne(id);
    const datos = convertirFechas(dto, ['fechaDesde', 'fechaHasta'] as const);
    validarRangos({ ...actual, ...datos }, [['fechaDesde', 'fechaHasta']]);
    return operacion(() =>
      this.prisma.periodoInscripcion.update({ where: { id }, data: datos }),
    );
  }
  remove(id: number) {
    return operacion(() =>
      this.prisma.periodoInscripcion.delete({ where: { id } }),
    );
  }
}
