import { HttpException, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

const UN_MINUTO = 60000;

// Límite de pedidos POST por minuto, por IP y por ruta. Frena los intentos de
// adivinar contraseñas probando muchas seguidas: 20 registros, 30 logins y 60
// pedidos para el resto. Si se pasa, responde 429 (demasiadas solicitudes)
@Injectable()
export class LimitePedidosGuard implements CanActivate {
  private readonly visitas = new Map<
    string,
    { cantidad: number; vence: number }
  >();
  private ultimaLimpieza = 0;

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    // Solo se cuentan los POST. El webhook de WhatsApp tiene su propia verificación
    if (req.method !== 'POST' || req.path.endsWith('/whatsapp')) return true;

    const ahora = Date.now();
    // Cada minuto se borran los contadores vencidos, para no acumular memoria
    if (ahora - this.ultimaLimpieza > UN_MINUTO) {
      for (const [clave, dato] of this.visitas)
        if (dato.vence <= ahora) this.visitas.delete(clave);
      this.ultimaLimpieza = ahora;
    }

    const clave = `${req.ip}:${context.getClass().name}:${context.getHandler().name}`;
    const anterior = this.visitas.get(clave);
    const dato =
      anterior && anterior.vence > ahora
        ? anterior
        : { cantidad: 0, vence: ahora + UN_MINUTO };
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
    this.visitas.set(clave, dato);
    return true;
  }
}
