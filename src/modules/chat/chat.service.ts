import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto.js';
import { UpdateChatDto } from './dto/update-chat.dto.js';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../../generated/prisma/client.js';
import { AsistenteService } from '../asistente/asistente.service.js';
import type { RespuestaAsistente } from '../asistente/respuesta.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import { operacion } from '../../common/database/operaciones.js';

const conversacionPublica = {
  id: true,
  canal: true,
  estado: true,
  iniciadaEn: true,
  mensajes: {
    orderBy: { id: 'desc' as const },
    take: 100,
    include: { documento: { select: { id: true, titulo: true, url: true } } },
  },
  derivaciones: {
    select: { id: true, estado: true, respuesta: true, prioridad: true },
  },
} as const;
const resumen = {
  id: true,
  canal: true,
  estado: true,
  iniciadaEn: true,
  _count: { select: { mensajes: true, derivaciones: true } },
} as const;
const huella = (token: string) =>
  createHash('sha256').update(token).digest('hex');

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly asistente: AsistenteService,
  ) {}

  private async guardarRespuesta(
    tx: Prisma.TransactionClient,
    id: number,
    consulta: string,
    respuesta: RespuestaAsistente,
    duracionMs: number,
  ) {
    const fuentes = respuesta.fuentes.map((f) => ({
      id: f.id,
      titulo: f.titulo,
      url: f.url ?? null,
      documentoId: f.documentoId ?? null,
    }));
    await tx.mensaje.create({
      data: { conversacionId: id, rol: 'ESTUDIANTE', texto: consulta },
    });
    await tx.mensaje.create({
      data: {
        conversacionId: id,
        rol: 'ASISTENTE',
        texto: respuesta.texto,
        documentoId: respuesta.fuentes[0]?.documentoId,
        fuentes,
      },
    });
    await tx.consultaAsistente.create({
      data: {
        conversacionId: id,
        consulta,
        estrategia: respuesta.estrategia,
        proveedor: respuesta.proveedor,
        duracionMs,
        cantidadFuentes: fuentes.length,
        tokensEntrada: respuesta.tokensEntrada,
        tokensSalida: respuesta.tokensSalida,
      },
    });
    if (
      respuesta.derivar &&
      !(await tx.derivacion.findFirst({
        where: { conversacionId: id, estado: { not: 'RESUELTA' } },
      }))
    ) {
      await tx.derivacion.create({
        data: { conversacionId: id, motivo: consulta },
      });
    }
  }

  async create(dto: CreateChatDto, origenVerificado = false) {
    if (dto.canal !== 'WEB' && !origenVerificado)
      throw new BadRequestException(
        'El canal WHATSAPP solo admite pedidos del webhook verificado.',
      );
    const consulta = dto.mensaje.trim();
    if (!consulta)
      throw new BadRequestException('El mensaje no puede estar vacío.');
    const inicio = performance.now();
    const respuesta = await this.asistente.responder(consulta);
    const token = randomBytes(32).toString('base64url');
    const conversacion = await operacion(() =>
      this.prisma.$transaction(
        async (tx) => {
          const nueva = await tx.conversacion.create({
            data: { canal: dto.canal, accesoHash: huella(token) },
          });
          await this.guardarRespuesta(
            tx,
            nueva.id,
            consulta,
            respuesta,
            Math.round(performance.now() - inicio),
          );
          return tx.conversacion.findUniqueOrThrow({
            where: { id: nueva.id },
            select: conversacionPublica,
          });
        },
        { timeout: 15000 },
      ),
    );
    return {
      ...conversacion,
      mensajes: [...conversacion.mensajes].reverse(),
      tokenConversacion: token,
      respuesta: respuesta.texto,
      estrategia: respuesta.estrategia,
      fuentes: respuesta.fuentes,
      derivada: respuesta.derivar,
    };
  }

  async findAll(query: ListadoDto = new ListadoDto()) {
    const where = query.estado ? { estado: query.estado } : {};
    const [datos, total] = await this.prisma.$transaction([
      this.prisma.conversacion.findMany({
        where,
        select: resumen,
        orderBy: { id: 'desc' },
        skip: (query.pagina - 1) * query.limite,
        take: query.limite,
      }),
      this.prisma.conversacion.count({ where }),
    ]);
    return { datos, total, pagina: query.pagina, limite: query.limite };
  }

  async findOne(id: number) {
    const dato = await this.prisma.conversacion.findUnique({
      where: { id },
      select: conversacionPublica,
    });
    if (!dato) throw new NotFoundException('La conversación no existe.');
    return { ...dato, mensajes: [...dato.mensajes].reverse() };
  }

  async update(id: number, dto: UpdateChatDto) {
    const actual = await this.findOne(id);
    if (
      dto.mensaje !== undefined ||
      (dto.canal !== undefined && dto.canal !== actual.canal)
    )
      throw new BadRequestException(
        'Para agregar mensajes usá /chat/:id/mensajes. El canal no se modifica.',
      );
    return operacion(() =>
      this.prisma.conversacion.update({
        where: { id },
        data: { estado: dto.estado },
        select: resumen,
      }),
    );
  }

  remove(id: number) {
    return operacion(() =>
      this.prisma.conversacion.delete({ where: { id }, select: resumen }),
    );
  }

  private async autorizar(id: number, token?: string) {
    if (!token || token.length > 256)
      throw new ForbiddenException(
        'Se requiere el token privado de la conversación.',
      );
    const actual = await this.prisma.conversacion.findUnique({
      where: { id },
      select: { accesoHash: true, estado: true },
    });
    const recibido = Buffer.from(huella(token));
    const esperado = Buffer.from(actual?.accesoHash ?? '');
    if (
      !actual ||
      recibido.length !== esperado.length ||
      !timingSafeEqual(recibido, esperado)
    )
      throw new ForbiddenException('No tenés acceso a esa conversación.');
    return actual;
  }
  async leerPropia(id: number, token?: string) {
    await this.autorizar(id, token);
    return this.findOne(id);
  }
  async cerrarPropia(id: number, token?: string) {
    await this.autorizar(id, token);
    return this.update(id, { estado: 'CERRADA' as UpdateChatDto['estado'] });
  }
  async agregarMensaje(id: number, mensaje: string, token?: string) {
    await this.autorizar(id, token);
    return this.agregarInterno(id, mensaje);
  }
  async agregarInterno(id: number, mensaje: string) {
    const consulta = mensaje.trim();
    if (!consulta || consulta.length > 2000)
      throw new BadRequestException(
        'El mensaje debe tener entre 1 y 2000 caracteres.',
      );
    const actual = await this.findOne(id);
    if (actual.estado !== 'ABIERTA')
      throw new BadRequestException('La conversación está cerrada.');
    const inicio = performance.now();
    const respuesta = await this.asistente.responder(consulta);
    await operacion(() =>
      this.prisma.$transaction(
        async (tx) => {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(${id})`;
          const conversacion = await tx.conversacion.findUnique({
            where: { id },
          });
          if (!conversacion || conversacion.estado !== 'ABIERTA')
            throw new BadRequestException('La conversación está cerrada.');
          await this.guardarRespuesta(
            tx,
            id,
            consulta,
            respuesta,
            Math.round(performance.now() - inicio),
          );
        },
        { timeout: 15000 },
      ),
    );
    return {
      conversacionId: id,
      respuesta: respuesta.texto,
      estrategia: respuesta.estrategia,
      fuentes: respuesta.fuentes,
      derivada: respuesta.derivar,
    };
  }
}
