import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Publico } from '../auth/decorators/publico.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Controller()
@Publico()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }
  @Get('salud') async salud() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { estado: 'ok', baseDeDatos: 'disponible' };
    } catch {
      throw new ServiceUnavailableException(
        'La base de datos no está disponible.',
      );
    }
  }
}
