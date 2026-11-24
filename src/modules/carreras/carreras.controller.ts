import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarrerasService } from './carreras.service.js';
import { CreateCarreraDto } from './dto/create-carrera.dto.js';
import { UpdateCarreraDto } from './dto/update-carrera.dto.js';

@Controller('carreras')
export class CarrerasController {
  constructor(private readonly carrerasService: CarrerasService) {}

  @Post()
  create(@Body() createCarreraDto: CreateCarreraDto) {
    return this.carrerasService.create(createCarreraDto);
  }

  @Get()
  findAll() {
    return this.carrerasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carrerasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarreraDto: UpdateCarreraDto) {
    return this.carrerasService.update(+id, updateCarreraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carrerasService.remove(+id);
  }
}
