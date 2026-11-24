import { Module } from '@nestjs/common';
import { MesasExamenService } from './mesas-examen.service.js';
import { MesasExamenController } from './mesas-examen.controller.js';

@Module({
  controllers: [MesasExamenController],
  providers: [MesasExamenService],
})
export class MesasExamenModule {}
