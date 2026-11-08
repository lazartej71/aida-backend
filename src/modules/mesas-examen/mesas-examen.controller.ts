import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MesasExamenService } from './mesas-examen.service.js';
import { CreateMesasExamanDto } from './dto/create-mesas-examan.dto.js';
import { UpdateMesasExamanDto } from './dto/update-mesas-examan.dto.js';

@Controller('mesas-examen')
export class MesasExamenController {
  constructor(private readonly mesasExamenService: MesasExamenService) {}

  @Post()
  create(@Body() createMesasExamanDto: CreateMesasExamanDto) {
    return this.mesasExamenService.create(createMesasExamanDto);
  }

  @Get()
  findAll() {
    return this.mesasExamenService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mesasExamenService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMesasExamanDto: UpdateMesasExamanDto) {
    return this.mesasExamenService.update(+id, updateMesasExamanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mesasExamenService.remove(+id);
  }
}
