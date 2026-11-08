import { Module } from '@nestjs/common';
import { CarrerasService } from './carreras.service.js';
import { CarrerasController } from './carreras.controller.js';

@Module({
  controllers: [CarrerasController],
  providers: [CarrerasService],
})
export class CarrerasModule {}
