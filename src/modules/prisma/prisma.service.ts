import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { crearPool } from '../../database/pool.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter: new PrismaPg(crearPool(), { disposeExternalPool: true }),
      errorFormat: 'minimal',
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch {
      throw new Error(
        'No se pudo conectar con PostgreSQL. Ejecutá npm run db:check para revisar la configuración.',
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
