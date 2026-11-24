import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateIngresoDto } from './dto/create-ingreso.dto.js';
import { UpdateIngresoDto } from './dto/update-ingreso.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import {
  operacion,
  convertirFechas,
  validarRangos,
} from '../../common/database/operaciones.js';

@Injectable()
export class IngresoService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateIngresoDto) {
    const datos = convertirFechas(dto, [
      'inscripcionDesde',
      'inscripcionHasta',
    ] as const);
    validarRangos(datos, [['inscripcionDesde', 'inscripcionHasta']]);
    return operacion(() => this.prisma.infoIngreso.create({ data: datos }));
  }
  async findAll(query: ListadoDto = new ListadoDto()) {
    const where = {
      ...(query.busqueda
        ? {
            OR: ['titulo', 'descripcion'].map((campo) => ({
              [campo]: {
                contains: query.busqueda,
                mode: 'insensitive' as const,
              },
            })),
          }
        : {}),
    };
    const [datos, total] = await operacion(() =>
      this.prisma.$transaction([
        this.prisma.infoIngreso.findMany({
          where,
          orderBy: { id: 'asc' },
          skip: (query.pagina - 1) * query.limite,
          take: query.limite,
        }),
        this.prisma.infoIngreso.count({ where }),
      ]),
    );
    return { datos, total, pagina: query.pagina, limite: query.limite };
  }
  async findOne(id: number) {
    const dato = await operacion(() =>
      this.prisma.infoIngreso.findUnique({ where: { id } }),
    );
    if (!dato) throw new NotFoundException('El registro no existe.');
    return dato;
  }
  async update(id: number, dto: UpdateIngresoDto) {
    const actual = await this.findOne(id);
    const datos = convertirFechas(dto, [
      'inscripcionDesde',
      'inscripcionHasta',
    ] as const);
    validarRangos({ ...actual, ...datos }, [
      ['inscripcionDesde', 'inscripcionHasta'],
    ]);
    return operacion(() =>
      this.prisma.infoIngreso.update({ where: { id }, data: datos }),
    );
  }
  remove(id: number) {
    return operacion(() => this.prisma.infoIngreso.delete({ where: { id } }));
  }
}
