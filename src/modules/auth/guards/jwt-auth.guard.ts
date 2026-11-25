import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service.js';
import { obtenerJwtSecret } from '../auth.config.js';
import { PUBLICO } from '../decorators/publico.decorator.js';
import type { PeticionAutenticada } from '../interfaces/peticion-autenticada.interface.js';

// Autenticación: comprueba QUIÉN hace el pedido.
// Se aplica a todas las rutas (es un guard global, registrado en AuthModule),
// salvo las marcadas con @Publico(). Pasos:
// 1. Busca el token en el encabezado "Authorization: Bearer <token>".
// 2. Verifica la firma y el vencimiento del JWT con la clave JWT_SECRET.
// 3. Busca al usuario en la base: tiene que existir, estar activo y que el token
//    no haya sido revocado (cerrar sesión o cambiar la contraseña suben tokenVersion).
// 4. Deja los datos del usuario en req.usuario para el resto de la petición.
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    // El Reflector lee la metadata que dejó @Publico() en la ruta o en el controlador
    const esPublica = this.reflector.getAllAndOverride<boolean>(PUBLICO, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (esPublica) return true;

    // 1. Token
    const req = context.switchToHttp().getRequest<PeticionAutenticada>();
    const encontrado = /^Bearer ([^\s]+)$/.exec(
      req.headers.authorization ?? '',
    );
    if (!encontrado)
      throw new UnauthorizedException('Se requiere un token Bearer.');

    // 2. Firma y vencimiento
    let payload: { sub: number; version: number; scope?: string };
    try {
      payload = await this.jwt.verifyAsync(encontrado[1], {
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

    // 3. Usuario vigente
    const usuario = await this.prisma.usuario.findUnique({
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
    if (!usuario || !usuario.activo || usuario.tokenVersion !== payload.version)
      throw new UnauthorizedException('La sesión ya no está activa.');

    // 4. Usuario disponible en el resto de la petición
    req.usuario = usuario;
    return true;
  }
}
