import { Module } from '@nestjs/common';
import { PreguntasFrecuentesService } from './preguntas-frecuentes.service.js';
import { PreguntasFrecuentesController } from './preguntas-frecuentes.controller.js';

@Module({
  controllers: [PreguntasFrecuentesController],
  providers: [PreguntasFrecuentesService],
})
export class PreguntasFrecuentesModule {}
