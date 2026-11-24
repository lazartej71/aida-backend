import { Catch, HttpException, Logger } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { operacion } from '../database/operaciones.js';

// Nombre, código y mensaje del error original, para poder diagnosticarlo en los
// registros del servidor. Las credenciales de una URL de conexión se ocultan
function describirCausa(error: unknown, profundidad = 0): string {
  if (!(error instanceof Error)) return String(error);
  const code = 'code' in error && error.code ? ` [${String(error.code)}]` : '';
  const mensaje = error.message.replace(
    /(postgres(?:ql)?:\/\/)[^@\s]+@/gi,
    '$1***@',
  );
  const causa =
    error.cause && profundidad < 3
      ? ` <- ${describirCausa(error.cause, profundidad + 1)}`
      : '';
  return `${error.name}${code}: ${mensaje}${causa}`;
}

@Catch()
export class ErroresFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErroresFilter.name);
  async catch(error: unknown, host: ArgumentsHost) {
    let fallo = error;
    if (!(fallo instanceof HttpException)) {
      try {
        await operacion(() => Promise.reject(error));
      } catch (mapped) {
        fallo = mapped;
      }
    }
    const res = host.switchToHttp().getResponse<Response>();
    if (fallo instanceof HttpException) {
      const body = fallo.getResponse();
      return res
        .status(fallo.getStatus())
        .json(
          typeof body === 'string'
            ? { statusCode: fallo.getStatus(), message: body }
            : body,
        );
    }
    if (error instanceof Error && error.name === 'PrismaClientValidationError')
      return res.status(400).json({
        statusCode: 400,
        message: 'Los datos enviados no son válidos.',
      });
    this.logger.error(
      `Error interno al procesar una solicitud: ${describirCausa(error)}`,
    );
    return res.status(500).json({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'No se pudo completar la solicitud.',
    });
  }
}
