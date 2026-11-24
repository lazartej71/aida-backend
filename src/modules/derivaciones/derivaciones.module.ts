import { Module } from '@nestjs/common';
import { DerivacionesService } from './derivaciones.service.js';
import { DerivacionesController } from './derivaciones.controller.js';

@Module({
  controllers: [DerivacionesController],
  providers: [DerivacionesService],
})
export class DerivacionesModule {}
