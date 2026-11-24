import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTramiteDto } from './dto/create-tramite.dto.js';
import { UpdateTramiteDto } from './dto/update-tramite.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import {
  operacion,
  convertirFechas,
  validarRangos,
} from '../../common/database/operaciones.js';

@Injectable()
export class TramitesService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateTramiteDto) {
    const datos = convertirFechas(dto, ['plazoDesde', 'plazoHasta'] as const);
    validarRangos(datos, [['plazoDesde', 'plazoHasta']]);
    return operacion(() => this.prisma.tramite.create({ data: datos }));
  }
  async findAll(query: ListadoDto = new ListadoDto()) {
    const where = {
      ...(query.busqueda
        ? {
            OR: ['nombre', 'descripcion'].map((campo) => ({
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
        this.prisma.tramite.findMany({
          where,
          orderBy: { id: 'asc' },
          skip: (query.pagina - 1) * query.limite,
          take: query.limite,
        }),
        this.prisma.tramite.count({ where }),
      ]),
    );
    return { datos, total, pagina: query.pagina, limite: query.limite };
  }
  async findOne(id: number) {
    const dato = await operacion(() =>
      this.prisma.tramite.findUnique({ where: { id } }),
    );
    if (!dato) throw new NotFoundException('El registro no existe.');
    return dato;
  }
  async update(id: number, dto: UpdateTramiteDto) {
    const actual = await this.findOne(id);
    const datos = convertirFechas(dto, ['plazoDesde', 'plazoHasta'] as const);
    validarRangos({ ...actual, ...datos }, [['plazoDesde', 'plazoHasta']]);
    return operacion(() =>
      this.prisma.tramite.update({ where: { id }, data: datos }),
    );
  }
  remove(id: number) {
    return operacion(() => this.prisma.tramite.delete({ where: { id } }));
  }
}
