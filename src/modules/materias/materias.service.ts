import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMateriaDto } from './dto/create-materia.dto.js';
import { UpdateMateriaDto } from './dto/update-materia.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import { operacion, limpiarDatos } from '../../common/database/operaciones.js';
import { CorrelatividadDto } from './dto/correlatividad.dto.js';

@Injectable()
export class MateriasService {
  async correlatividades(id: number) {
    await this.findOne(id);
    return this.prisma.correlatividad.findMany({
      where: { materiaId: id },
      include: { requiere: true },
      orderBy: [{ para: 'asc' }, { requiereId: 'asc' }],
    });
  }
  guardarCorrelatividad(id: number, dto: CorrelatividadDto) {
    return operacion(() =>
      this.prisma.$transaction(
        async (tx) => {
          const materia = await tx.materia.findUnique({ where: { id } });
          const requiere = await tx.materia.findUnique({
            where: { id: dto.requiereId },
          });
          if (!materia || !requiere)
            throw new NotFoundException('La materia o su requisito no existe.');
          if (id === dto.requiereId || materia.carreraId !== requiere.carreraId)
            throw new BadRequestException(
              'El requisito debe ser otra materia de la misma carrera.',
            );
          const relaciones = await tx.correlatividad.findMany({
            where: {
              para: dto.para,
              materia: { carreraId: materia.carreraId },
            },
          });
          const pendientes = [dto.requiereId];
          const vistos = new Set<number>();
          while (pendientes.length) {
            const actual = pendientes.pop()!;
            if (actual === id)
              throw new BadRequestException(
                'La correlatividad produciría un ciclo.',
              );
            if (vistos.has(actual)) continue;
            vistos.add(actual);
            pendientes.push(
              ...relaciones
                .filter((r) => r.materiaId === actual)
                .map((r) => r.requiereId),
            );
          }
          return tx.correlatividad.upsert({
            where: {
              materiaId_requiereId_para: {
                materiaId: id,
                requiereId: dto.requiereId,
                para: dto.para,
              },
            },
            create: { materiaId: id, ...dto },
            update: { condicion: dto.condicion },
          });
        },
        { isolationLevel: 'Serializable' },
      ),
    );
  }
  quitarCorrelatividad(id: number, requiereId: number, para: string) {
    if (!['CURSAR', 'RENDIR'].includes(para))
      throw new BadRequestException('El destino debe ser CURSAR o RENDIR.');
    return operacion(() =>
      this.prisma.correlatividad.delete({
        where: {
          materiaId_requiereId_para: { materiaId: id, requiereId, para },
        },
      }),
    );
  }
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateMateriaDto) {
    const datos = limpiarDatos(dto);
    return operacion(() => this.prisma.materia.create({ data: datos }));
  }
  async findAll(query: ListadoDto = new ListadoDto()) {
    const where = {
      ...(query.busqueda
        ? {
            nombre: { contains: query.busqueda, mode: 'insensitive' as const },
          }
        : {}),
      ...(query.carreraId !== undefined ? { carreraId: query.carreraId } : {}),
    };
    const [datos, total] = await operacion(() =>
      this.prisma.$transaction([
        this.prisma.materia.findMany({
          where,
          orderBy: { id: 'asc' },
          skip: (query.pagina - 1) * query.limite,
          take: query.limite,
        }),
        this.prisma.materia.count({ where }),
      ]),
    );
    return { datos, total, pagina: query.pagina, limite: query.limite };
  }
  async findOne(id: number) {
    const dato = await operacion(() =>
      this.prisma.materia.findUnique({ where: { id } }),
    );
    if (!dato) throw new NotFoundException('El registro no existe.');
    return dato;
  }
  async update(id: number, dto: UpdateMateriaDto) {
    // Si el registro no existe, findOne responde 404 antes de intentar actualizar
    await this.findOne(id);
    const datos = limpiarDatos(dto);
    return operacion(() =>
      this.prisma.materia.update({ where: { id }, data: datos }),
    );
  }
  remove(id: number) {
    return operacion(() => this.prisma.materia.delete({ where: { id } }));
  }
}
