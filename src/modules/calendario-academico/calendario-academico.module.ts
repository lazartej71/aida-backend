import { Module } from '@nestjs/common';
import { CalendarioAcademicoService } from './calendario-academico.service.js';
import { CalendarioAcademicoController } from './calendario-academico.controller.js';

@Module({
  controllers: [CalendarioAcademicoController],
  providers: [CalendarioAcademicoService],
})
export class CalendarioAcademicoModule {}
