import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PreguntasFrecuentesService } from './preguntas-frecuentes.service.js';
import { CreatePreguntasFrecuenteDto } from './dto/create-preguntas-frecuente.dto.js';
import { UpdatePreguntasFrecuenteDto } from './dto/update-preguntas-frecuente.dto.js';

@Controller('preguntas-frecuentes')
export class PreguntasFrecuentesController {
  constructor(private readonly preguntasFrecuentesService: PreguntasFrecuentesService) {}

  @Post()
  create(@Body() createPreguntasFrecuenteDto: CreatePreguntasFrecuenteDto) {
    return this.preguntasFrecuentesService.create(createPreguntasFrecuenteDto);
  }

  @Get()
  findAll() {
    return this.preguntasFrecuentesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.preguntasFrecuentesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePreguntasFrecuenteDto: UpdatePreguntasFrecuenteDto) {
    return this.preguntasFrecuentesService.update(+id, updatePreguntasFrecuenteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.preguntasFrecuentesService.remove(+id);
  }
}
