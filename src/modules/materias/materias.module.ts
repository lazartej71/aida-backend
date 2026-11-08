import { Module } from '@nestjs/common';
import { MateriasService } from './materias.service.js';
import { MateriasController } from './materias.controller.js';

@Module({
  controllers: [MateriasController],
  providers: [MateriasService],
})
export class MateriasModule {}
