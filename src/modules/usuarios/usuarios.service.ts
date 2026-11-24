import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import { operacion } from '../../common/database/operaciones.js';

export const usuarioPublico = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  activo: true,
  creadoEn: true,
  actualizadoEn: true,
} as const;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  crearParaRegistro(nombre: string, email: string, passwordHash: string) {
    return this.prisma.usuario.create({
      data: { nombre, email, passwordHash },
      select: usuarioPublico,
    });
  }

  buscarPorEmail(email: string) {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  async findAll(query: ListadoDto = new ListadoDto()) {
    const where = query.busqueda
      ? {
          OR: [
            {
              nombre: {
                contains: query.busqueda,
                mode: 'insensitive' as const,
              },
            },
            {
              email: { contains: query.busqueda, mode: 'insensitive' as const },
            },
          ],
        }
      : {};
    const [datos, total] = await operacion(() =>
      this.prisma.$transaction([
        this.prisma.usuario.findMany({
          where,
          select: usuarioPublico,
          orderBy: { id: 'asc' },
          skip: (query.pagina - 1) * query.limite,
          take: query.limite,
        }),
        this.prisma.usuario.count({ where }),
      ]),
    );
    return { datos, total, pagina: query.pagina, limite: query.limite };
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      select: usuarioPublico,
    });
    if (!user) throw new NotFoundException('El usuario no existe.');
    return user;
  }

  update(id: number, dto: UpdateUsuarioDto) {
    return operacion(() =>
      this.prisma.$transaction(
        async (tx) => {
          const actual = await tx.usuario.findUnique({ where: { id } });
          if (!actual) throw new NotFoundException('El usuario no existe.');
          if (
            actual.rol === 'ADMIN' &&
            actual.activo &&
            ((dto.rol && dto.rol !== 'ADMIN') || dto.activo === false) &&
            (await tx.usuario.count({
              where: { rol: 'ADMIN', activo: true },
            })) <= 1
          )
            throw new BadRequestException(
              'Debe quedar al menos un administrador activo.',
            );
          return tx.usuario.update({
            where: { id },
            data: { ...dto, tokenVersion: { increment: 1 } },
            select: usuarioPublico,
          });
        },
        { isolationLevel: 'Serializable' },
      ),
    );
  }

  remove(id: number) {
    return operacion(() =>
      this.prisma.$transaction(
        async (tx) => {
          const actual = await tx.usuario.findUnique({ where: { id } });
          if (!actual) throw new NotFoundException('El usuario no existe.');
          if (
            actual.rol === 'ADMIN' &&
            actual.activo &&
            (await tx.usuario.count({
              where: { rol: 'ADMIN', activo: true },
            })) <= 1
          )
            throw new BadRequestException(
              'No se puede eliminar el último administrador activo.',
            );
          return tx.usuario.delete({ where: { id }, select: usuarioPublico });
        },
        { isolationLevel: 'Serializable' },
      ),
    );
  }
}
