import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCalendarioAcademicoDto } from './dto/create-calendario-academico.dto.js';
import { UpdateCalendarioAcademicoDto } from './dto/update-calendario-academico.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import {
  operacion,
  convertirFechas,
  validarRangos,
} from '../../common/database/operaciones.js';

@Injectable()
export class CalendarioAcademicoService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateCalendarioAcademicoDto) {
    const datos = convertirFechas(dto, ['fechaDesde', 'fechaHasta'] as const);
    validarRangos(datos, [['fechaDesde', 'fechaHasta']]);
    return operacion(() => this.prisma.eventoAcademico.create({ data: datos }));
  }
  async findAll(query: ListadoDto = new ListadoDto()) {
    const where = {
      ...(query.busqueda
        ? {
            OR: ['titulo'].map((campo) => ({
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
        this.prisma.eventoAcademico.findMany({
          where,
          orderBy: { id: 'asc' },
          skip: (query.pagina - 1) * query.limite,
          take: query.limite,
        }),
        this.prisma.eventoAcademico.count({ where }),
      ]),
    );
    return { datos, total, pagina: query.pagina, limite: query.limite };
  }
  async findOne(id: number) {
    const dato = await operacion(() =>
      this.prisma.eventoAcademico.findUnique({ where: { id } }),
    );
    if (!dato) throw new NotFoundException('El registro no existe.');
    return dato;
  }
  async update(id: number, dto: UpdateCalendarioAcademicoDto) {
    const actual = await this.findOne(id);
    const datos = convertirFechas(dto, ['fechaDesde', 'fechaHasta'] as const);
    validarRangos({ ...actual, ...datos }, [['fechaDesde', 'fechaHasta']]);
    return operacion(() =>
      this.prisma.eventoAcademico.update({ where: { id }, data: datos }),
    );
  }
  remove(id: number) {
    return operacion(() =>
      this.prisma.eventoAcademico.delete({ where: { id } }),
    );
  }
}
