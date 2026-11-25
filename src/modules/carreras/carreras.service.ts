import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCarreraDto } from './dto/create-carrera.dto.js';
import { UpdateCarreraDto } from './dto/update-carrera.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import { operacion, limpiarDatos } from '../../common/database/operaciones.js';

// Service de carreras: la lógica y el acceso a la base, con Prisma.
// @Injectable() permite que Nest lo inyecte en el controller.
// operacion() traduce los errores de la base a respuestas HTTP (por ejemplo,
// un nombre repetido es un 409) y limpiarDatos() quita los espacios de los textos
@Injectable()
export class CarrerasService {
  constructor(private readonly prisma: PrismaService) {}

  // INSERT en la tabla carreras
  create(dto: CreateCarreraDto) {
    const datos = limpiarDatos(dto);
    return operacion(() => this.prisma.carrera.create({ data: datos }));
  }

  // Listado paginado: busca por nombre y filtra por tipo si se piden.
  // La transacción hace las dos consultas juntas: los datos de la página y el total
  async findAll(query: ListadoDto = new ListadoDto()) {
    const where = {
      ...(query.busqueda
        ? {
            nombre: { contains: query.busqueda, mode: 'insensitive' as const },
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

  // Una carrera por id; si no existe responde 404
  async findOne(id: number) {
    const dato = await operacion(() =>
      this.prisma.carrera.findUnique({ where: { id } }),
    );
    if (!dato) throw new NotFoundException('El registro no existe.');
    return dato;
  }

  // UPDATE de los campos enviados
  async update(id: number, dto: UpdateCarreraDto) {
    // Si el registro no existe, findOne responde 404 antes de intentar actualizar
    await this.findOne(id);
    const datos = limpiarDatos(dto);
    return operacion(() =>
      this.prisma.carrera.update({ where: { id }, data: datos }),
    );
  }

  // DELETE. Si la carrera tiene materias, la base no deja borrarla y responde 409
  remove(id: number) {
    return operacion(() => this.prisma.carrera.delete({ where: { id } }));
  }
}
