import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCarreraDto } from './dto/create-carrera.dto.js';
import { UpdateCarreraDto } from './dto/update-carrera.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import { operacion, limpiarDatos } from '../../common/database/operaciones.js';

@Injectable()
export class CarrerasService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateCarreraDto) {
    const datos = limpiarDatos(dto);
    return operacion(() => this.prisma.carrera.create({ data: datos }));
  }
  async findAll(query: ListadoDto = new ListadoDto()) {
    const where = {
      ...(query.busqueda
        ? {
            OR: ['nombre'].map((campo) => ({
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
        this.prisma.carrera.findMany({
          where,
          orderBy: { id: 'asc' },
          skip: (query.pagina - 1) * query.limite,
          take: query.limite,
        }),
        this.prisma.carrera.count({ where }),
      ]),
    );
    return { datos, total, pagina: query.pagina, limite: query.limite };
  }
  async findOne(id: number) {
    const dato = await operacion(() =>
      this.prisma.carrera.findUnique({ where: { id } }),
    );
    if (!dato) throw new NotFoundException('El registro no existe.');
    return dato;
  }
  async update(id: number, dto: UpdateCarreraDto) {
    const actual = await this.findOne(id);
    const datos = limpiarDatos(dto);
    void actual;
    return operacion(() =>
      this.prisma.carrera.update({ where: { id }, data: datos }),
    );
  }
  remove(id: number) {
    return operacion(() => this.prisma.carrera.delete({ where: { id } }));
  }
}
