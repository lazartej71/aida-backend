import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDerivacioneDto } from './dto/create-derivacione.dto.js';
import { UpdateDerivacioneDto } from './dto/update-derivacione.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import { operacion } from '../../common/database/operaciones.js';

@Injectable()
export class DerivacionesService {
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateDerivacioneDto) {
    return operacion(() => this.prisma.derivacion.create({ data: dto }));
  }

  async findAll(query: ListadoDto = new ListadoDto()) {
    const where = {
      ...(query.estado ? { estado: query.estado } : {}),
      ...(query.conversacionId ? { conversacionId: query.conversacionId } : {}),
      ...(query.busqueda
        ? { motivo: { contains: query.busqueda, mode: 'insensitive' as const } }
        : {}),
    };
    const [datos, total] = await this.prisma.$transaction([
      this.prisma.derivacion.findMany({
        where,
        orderBy: { creadaEn: 'desc' },
        skip: (query.pagina - 1) * query.limite,
        take: query.limite,
        include: {
          conversacion: {
            select: { canal: true, estado: true, iniciadaEn: true },
          },
        },
      }),
      this.prisma.derivacion.count({ where }),
    ]);
    return { datos, total, pagina: query.pagina, limite: query.limite };
  }

  async findOne(id: number) {
    const dato = await this.prisma.derivacion.findUnique({
      where: { id },
      include: {
        conversacion: {
          select: {
            id: true,
            canal: true,
            estado: true,
            mensajes: { orderBy: { enviadoEn: 'asc' }, take: 100 },
          },
        },
      },
    });
    if (!dato) throw new NotFoundException('La derivación no existe.');
    return dato;
  }

  update(id: number, dto: UpdateDerivacioneDto) {
    return operacion(() =>
      this.prisma.$transaction(
        async (tx) => {
          const actual = await tx.derivacion.findUnique({ where: { id } });
          if (!actual) throw new NotFoundException('La derivación no existe.');
          const resuelta = (dto.estado ?? actual.estado) === 'RESUELTA';
          const respuesta = dto.respuesta?.trim() ?? actual.respuesta;
          if (resuelta && !respuesta?.trim())
            throw new BadRequestException(
              'Una derivación resuelta debe tener una respuesta.',
            );
          if (
            dto.conversacionId !== undefined &&
            dto.conversacionId !== actual.conversacionId
          )
            throw new BadRequestException(
              'No se puede mover la derivación a otra conversación.',
            );
          const dato = await tx.derivacion.update({
            where: { id },
            data: {
              ...dto,
              respuesta,
              resueltaEn: resuelta ? (actual.resueltaEn ?? new Date()) : null,
            },
          });
          if (
            resuelta &&
            (actual.estado !== 'RESUELTA' || respuesta !== actual.respuesta)
          )
            await tx.mensaje.create({
              data: {
                conversacionId: actual.conversacionId,
                rol: 'ASISTENTE',
                texto: `Respuesta del personal: ${respuesta}`,
              },
            });
          return dato;
        },
        { isolationLevel: 'Serializable' },
      ),
    );
  }

  remove(id: number) {
    return operacion(() => this.prisma.derivacion.delete({ where: { id } }));
  }
}
