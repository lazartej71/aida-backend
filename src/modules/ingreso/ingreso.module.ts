import { Module } from '@nestjs/common';
import { IngresoService } from './ingreso.service.js';
import { IngresoController } from './ingreso.controller.js';

@Module({
  controllers: [IngresoController],
  providers: [IngresoService],
})
export class IngresoModule {}
