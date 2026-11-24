import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMesasExamanDto } from './dto/create-mesas-examan.dto.js';
import { UpdateMesasExamanDto } from './dto/update-mesas-examan.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import {
  operacion,
  convertirFechas,
  validarRangos,
} from '../../common/database/operaciones.js';

@Injectable()
export class MesasExamenService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateMesasExamanDto) {
    const datos = convertirFechas(dto, ['fecha', 'cierreInscripcion'] as const);
    validarRangos(datos, [['cierreInscripcion', 'fecha', true]]);
    return operacion(() => this.prisma.mesaExamen.create({ data: datos }));
  }
  async findAll(query: ListadoDto = new ListadoDto()) {
    const where = {
      ...(query.materiaId !== undefined ? { materiaId: query.materiaId } : {}),
    };
    const [datos, total] = await operacion(() =>
      this.prisma.$transaction([
        this.prisma.mesaExamen.findMany({
          where,
          orderBy: { id: 'asc' },
          skip: (query.pagina - 1) * query.limite,
          take: query.limite,
        }),
        this.prisma.mesaExamen.count({ where }),
      ]),
    );
    return { datos, total, pagina: query.pagina, limite: query.limite };
  }
  async findOne(id: number) {
    const dato = await operacion(() =>
      this.prisma.mesaExamen.findUnique({ where: { id } }),
    );
    if (!dato) throw new NotFoundException('El registro no existe.');
    return dato;
  }
  async update(id: number, dto: UpdateMesasExamanDto) {
    const actual = await this.findOne(id);
    const datos = convertirFechas(dto, ['fecha', 'cierreInscripcion'] as const);
    validarRangos({ ...actual, ...datos }, [
      ['cierreInscripcion', 'fecha', true],
    ]);
    return operacion(() =>
      this.prisma.mesaExamen.update({ where: { id }, data: datos }),
    );
  }
  remove(id: number) {
    return operacion(() => this.prisma.mesaExamen.delete({ where: { id } }));
  }
}
