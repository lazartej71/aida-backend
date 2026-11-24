import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { ChatService } from '../chat/chat.service.js';
import { Canal } from '../../common/enums/canal.enum.js';

interface TextoWhatsApp {
  id: string;
  from: string;
  type: string;
  text?: { body?: string };
}
interface WebhookWhatsApp {
  entry?: {
    changes?: {
      value?: {
        metadata?: { phone_number_id?: string };
        messages?: TextoWhatsApp[];
      };
    }[];
  }[];
}
@Injectable()
export class CanalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chat: ChatService,
  ) {}
  estado() {
    return {
      web: { disponible: true },
      whatsapp: {
        configurado: [
          'WHATSAPP_APP_SECRET',
          'WHATSAPP_VERIFY_TOKEN',
          'WHATSAPP_ACCESS_TOKEN',
          'WHATSAPP_PHONE_NUMBER_ID',
          'WHATSAPP_GRAPH_VERSION',
        ].every((k) => Boolean(process.env[k])),
      },
    };
  }
  private configurar() {
    if (!this.estado().whatsapp.configurado)
      throw new ServiceUnavailableException(
        'WhatsApp no está configurado. El canal web está disponible.',
      );
    if (
      !/^v\d+\.\d+$/.test(process.env.WHATSAPP_GRAPH_VERSION!) ||
      !/^\d+$/.test(process.env.WHATSAPP_PHONE_NUMBER_ID!)
    )
      throw new ServiceUnavailableException(
        'La configuración de WhatsApp no es válida.',
      );
  }
  verificar(mode?: string, token?: string, challenge?: string) {
    this.configurar();
    if (
      mode !== 'subscribe' ||
      token !== process.env.WHATSAPP_VERIFY_TOKEN ||
      !challenge ||
      !/^\d{1,100}$/.test(challenge)
    )
      throw new ForbiddenException('Verificación de webhook rechazada.');
    return challenge;
  }
  async recibir(raw: Buffer | undefined, firma?: string) {
    this.configurar();
    if (!raw || !/^sha256=[a-f0-9]{64}$/.test(firma ?? ''))
      throw new ForbiddenException('Firma de webhook inválida.');
    const esperada = createHmac('sha256', process.env.WHATSAPP_APP_SECRET!)
      .update(raw)
      .digest();
    const recibida = Buffer.from(firma!.slice(7), 'hex');
    if (!timingSafeEqual(esperada, recibida))
      throw new ForbiddenException('Firma de webhook inválida.');
    let body: WebhookWhatsApp;
    try {
      body = JSON.parse(raw.toString('utf8'));
    } catch {
      throw new BadRequestException('Webhook inválido.');
    }
    if (!Array.isArray(body.entry) || body.entry.length > 20)
      throw new BadRequestException('Webhook inválido.');
    for (const entry of body.entry) {
      if (!Array.isArray(entry.changes) || entry.changes.length > 20) continue;
      for (const change of entry.changes) {
        if (
          change.value?.metadata?.phone_number_id !==
          process.env.WHATSAPP_PHONE_NUMBER_ID
        )
          continue;
        const mensajes = change.value?.messages;
        if (!Array.isArray(mensajes) || mensajes.length > 10) continue;
        for (const mensaje of mensajes) {
          if (mensaje.type !== 'text') continue;
          if (
            typeof mensaje.id !== 'string' ||
            mensaje.id.length > 200 ||
            !/^\d{5,20}$/.test(mensaje.from) ||
            typeof mensaje.text?.body !== 'string' ||
            !mensaje.text.body.trim() ||
            mensaje.text.body.length > 2000
          )
            throw new BadRequestException('Mensaje de WhatsApp inválido.');
          await this.procesar(mensaje);
        }
      }
    }
    return { recibido: true };
  }
  private async procesar(mensaje: TextoWhatsApp) {
    const remitenteHash = createHmac('sha256', process.env.WHATSAPP_APP_SECRET!)
      .update(mensaje.from)
      .digest('hex');
    let evento = await this.prisma.eventoCanal.findUnique({
      where: { id: mensaje.id },
    });
    if (evento?.estado === 'ENVIADO') return;
    if (!evento) {
      try {
        evento = await this.prisma.eventoCanal.create({
          data: { id: mensaje.id, remitenteHash },
        });
      } catch (error) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === 'P2002'
        )
          throw new ServiceUnavailableException(
            'El mensaje ya se está procesando.',
          );
        throw error;
      }
    }
    if (evento.remitenteHash !== remitenteHash)
      throw new ForbiddenException('El evento pertenece a otro remitente.');
    const adquirido = await this.prisma.eventoCanal.updateMany({
      where: {
        id: mensaje.id,
        OR: [
          { estado: { in: ['RECIBIDO', 'LISTO', 'ERROR_ENVIO'] } },
          {
            estado: 'PROCESANDO',
            actualizadoEn: { lt: new Date(Date.now() - 60000) },
          },
        ],
      },
      data: { estado: 'PROCESANDO' },
    });
    if (!adquirido.count)
      throw new ServiceUnavailableException(
        'El mensaje ya se está procesando.',
      );
    try {
      if (!evento.respuesta) {
        const previa = await this.prisma.eventoCanal.findFirst({
          where: {
            remitenteHash,
            conversacionId: { not: null },
            conversacion: { estado: 'ABIERTA' },
          },
          orderBy: { creadoEn: 'desc' },
        });
        const respuesta = previa?.conversacionId
          ? await this.chat.agregarInterno(
              previa.conversacionId,
              mensaje.text!.body!,
            )
          : await this.chat.create(
              { canal: Canal.WHATSAPP, mensaje: mensaje.text!.body! },
              true,
            );
        const conversacionId =
          'conversacionId' in respuesta
            ? respuesta.conversacionId
            : respuesta.id;
        evento = await this.prisma.eventoCanal.update({
          where: { id: mensaje.id },
          data: {
            conversacionId,
            respuesta: respuesta.respuesta,
            estado: 'LISTO',
          },
        });
      }
    } catch (error) {
      await this.prisma.eventoCanal.update({
        where: { id: mensaje.id },
        data: { estado: 'ERROR_ENVIO' },
      });
      throw error;
    }
    try {
      const respuesta = await fetch(
        `https://graph.facebook.com/${process.env.WHATSAPP_GRAPH_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          signal: AbortSignal.timeout(10000),
          redirect: 'error',
          headers: {
            authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: mensaje.from,
            type: 'text',
            text: { body: evento.respuesta!.slice(0, 4096) },
          }),
        },
      );
      if (!respuesta.ok) throw new Error('ENVIO');
      await this.prisma.eventoCanal.update({
        where: { id: mensaje.id },
        data: { estado: 'ENVIADO' },
      });
    } catch {
      await this.prisma.eventoCanal.update({
        where: { id: mensaje.id },
        data: { estado: 'ERROR_ENVIO' },
      });
      throw new ServiceUnavailableException(
        'No se pudo confirmar el envío de WhatsApp.',
      );
    }
  }
  eventos() {
    return this.prisma.eventoCanal.findMany({
      orderBy: { creadoEn: 'desc' },
      take: 100,
      select: {
        id: true,
        estado: true,
        conversacionId: true,
        creadoEn: true,
        actualizadoEn: true,
      },
    });
  }
}
