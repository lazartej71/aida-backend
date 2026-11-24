import { Catch, HttpException, Logger } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { operacion } from '../database/operaciones.js';
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
    this.logger.error('Error interno al procesar una solicitud.');
    return res.status(500).json({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'No se pudo completar la solicitud.',
    });
  }
}
