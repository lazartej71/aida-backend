import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CalendarioAcademicoService } from './calendario-academico.service.js';
import { CreateCalendarioAcademicoDto } from './dto/create-calendario-academico.dto.js';
import { UpdateCalendarioAcademicoDto } from './dto/update-calendario-academico.dto.js';

@Controller('calendario-academico')
export class CalendarioAcademicoController {
  constructor(private readonly calendarioAcademicoService: CalendarioAcademicoService) {}

  @Post()
  create(@Body() createCalendarioAcademicoDto: CreateCalendarioAcademicoDto) {
    return this.calendarioAcademicoService.create(createCalendarioAcademicoDto);
  }

  @Get()
  findAll() {
    return this.calendarioAcademicoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.calendarioAcademicoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCalendarioAcademicoDto: UpdateCalendarioAcademicoDto) {
    return this.calendarioAcademicoService.update(+id, updateCalendarioAcademicoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calendarioAcademicoService.remove(+id);
  }
}
