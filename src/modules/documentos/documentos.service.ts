import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDocumentoDto } from './dto/create-documento.dto.js';
import { UpdateDocumentoDto } from './dto/update-documento.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import {
  operacion,
  convertirFechas,
  validarRangos,
} from '../../common/database/operaciones.js';

@Injectable()
export class DocumentosService {
  async indexar(id: number, contenido: string) {
    const texto = contenido.trim();
    if (!texto)
      throw new BadRequestException('El contenido no puede estar vacío.');
    const fragmentos: string[] = [];
    for (let i = 0; i < texto.length; i += 1000)
      fragmentos.push(texto.slice(i, i + 1200));
    return operacion(() =>
      this.prisma.$transaction(async (tx) => {
        const documento = await tx.documento.update({
          where: { id },
          data: { versionActual: { increment: 1 } },
        });
        const version = await tx.versionDocumento.create({
          data: {
            documentoId: id,
            numero: documento.versionActual,
            contenido: texto,
            fragmentos: {
              create: fragmentos.map((contenido, orden) => ({
                contenido,
                orden,
              })),
            },
          },
          select: { id: true, numero: true, creadoEn: true },
        });
        return { documentoId: id, version, fragmentos: fragmentos.length };
      }),
    );
  }
  async versiones(id: number) {
    await this.findOne(id);
    return this.prisma.versionDocumento.findMany({
      where: { documentoId: id },
      orderBy: { numero: 'desc' },
      select: { id: true, numero: true, creadoEn: true },
    });
  }
  async leerVersion(id: number, numero: number) {
    const version = await this.prisma.versionDocumento.findUnique({
      where: { documentoId_numero: { documentoId: id, numero } },
    });
    if (!version) throw new NotFoundException('La versión no existe.');
    return version;
  }
  constructor(private readonly prisma: PrismaService) {}
  create(dto: CreateDocumentoDto) {
    const datos = convertirFechas(dto, [
      'vigenteDesde',
      'vigenteHasta',
    ] as const);
    validarRangos(datos, [['vigenteDesde', 'vigenteHasta']]);
    return operacion(() => this.prisma.documento.create({ data: datos }));
  }
  async findAll(query: ListadoDto = new ListadoDto()) {
    const where = {
      ...(query.busqueda
        ? {
            OR: ['titulo', 'numero'].map((campo) => ({
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
        this.prisma.documento.findMany({
          where,
          orderBy: { id: 'asc' },
          skip: (query.pagina - 1) * query.limite,
          take: query.limite,
        }),
        this.prisma.documento.count({ where }),
      ]),
    );
    return { datos, total, pagina: query.pagina, limite: query.limite };
  }
  async findOne(id: number) {
    const dato = await operacion(() =>
      this.prisma.documento.findUnique({ where: { id } }),
    );
    if (!dato) throw new NotFoundException('El registro no existe.');
    return dato;
  }
  async update(id: number, dto: UpdateDocumentoDto) {
    const actual = await this.findOne(id);
    const datos = convertirFechas(dto, [
      'vigenteDesde',
      'vigenteHasta',
    ] as const);
    validarRangos({ ...actual, ...datos }, [['vigenteDesde', 'vigenteHasta']]);
    return operacion(() =>
      this.prisma.documento.update({ where: { id }, data: datos }),
    );
  }
  remove(id: number) {
    return operacion(() => this.prisma.documento.delete({ where: { id } }));
  }
}
