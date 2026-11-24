import {
  ForbiddenException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';
import { obtenerJwtSecret } from './auth.config.js';
import { PUBLICO, ROLES } from './acceso.decorator.js';
export interface Sesion {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  tokenVersion: number;
}
export type PeticionAutenticada = Request & { usuario: Sesion };

@Injectable()
export class AccesoGuard implements CanActivate {
  private readonly visitas = new Map<
    string,
    { cantidad: number; vence: number }
  >();
  private ultimaLimpieza = 0;
  private limitar(req: Request, context: ExecutionContext) {
    if (req.method !== 'POST' || req.path.endsWith('/whatsapp')) return;
    const ahora = Date.now();
    if (ahora - this.ultimaLimpieza > 60000) {
      for (const [key, dato] of this.visitas)
        if (dato.vence <= ahora) this.visitas.delete(key);
      this.ultimaLimpieza = ahora;
    }
    const key = `${req.ip}:${context.getClass().name}:${context.getHandler().name}`;
    const visita = this.visitas.get(key);
    const dato =
      visita && visita.vence > ahora
        ? visita
        : { cantidad: 0, vence: ahora + 60000 };
    const limite = req.path.endsWith('/register')
      ? 20
      : req.path.endsWith('/login')
        ? 30
        : 60;
    if (++dato.cantidad > limite || this.visitas.size > 10000)
      throw new HttpException(
        'Demasiadas solicitudes. Intentá nuevamente en un minuto.',
        429,
      );
    this.visitas.set(key, dato);
  }
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext) {
    this.limitar(context.switchToHttp().getRequest<Request>(), context);
    if (
      this.reflector.getAllAndOverride<boolean>(PUBLICO, [
        context.getHandler(),
        context.getClass(),
      ])
    )
      return true;
    const req = context.switchToHttp().getRequest<PeticionAutenticada>();
    const match = /^Bearer ([^\s]+)$/.exec(req.headers.authorization ?? '');
    if (!match) throw new UnauthorizedException('Se requiere un token Bearer.');
    let payload: { sub: number; version: number; scope?: string };
    try {
      payload = await this.jwt.verifyAsync(match[1], {
        secret: obtenerJwtSecret(),
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException('El token es inválido o venció.');
    }
    if (
      !Number.isInteger(payload.sub) ||
      payload.sub < 1 ||
      !Number.isInteger(payload.version) ||
      payload.scope
    )
      throw new UnauthorizedException('Token inválido.');
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        tokenVersion: true,
      },
    });
    if (!user || !user.activo || user.tokenVersion !== payload.version)
      throw new UnauthorizedException('La sesión ya no está activa.');
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (roles?.length && !roles.includes(user.rol))
      throw new ForbiddenException('No tenés permisos para esta operación.');
    req.usuario = user;
    return true;
  }
}
