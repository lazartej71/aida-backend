import { Module } from '@nestjs/common';
import { CarrerasService } from './carreras.service.js';
import { CarrerasController } from './carreras.controller.js';

// Módulo de carreras: agrupa su controller y su service. Se importa en AppModule.
// PrismaService no hace falta declararlo: PrismaModule es global
@Module({
  controllers: [CarrerasController],
  providers: [CarrerasService],
})
export class CarrerasModule {}
