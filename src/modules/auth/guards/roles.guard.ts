import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PUBLICO } from '../decorators/publico.decorator.js';
import { ROLES } from '../decorators/roles.decorator.js';
import type { PeticionAutenticada } from '../interfaces/peticion-autenticada.interface.js';

// Autorización: comprueba QUÉ puede hacer el usuario.
// Corre después de JwtAuthGuard, así que req.usuario ya está cargado.
// Si la ruta tiene @Roles('PERSONAL', 'ADMIN'), el rol del usuario tiene que estar
// en esa lista; si no, responde 403 (prohibido). Sin @Roles, alcanza con la sesión
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const destinos = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(PUBLICO, destinos))
      return true;

    const roles = this.reflector.getAllAndOverride<string[]>(ROLES, destinos);
    if (!roles?.length) return true;

    const { usuario } = context
      .switchToHttp()
      .getRequest<PeticionAutenticada>();
    if (!roles.includes(usuario.rol))
      throw new ForbiddenException('No tenés permisos para esta operación.');
    return true;
  }
}
