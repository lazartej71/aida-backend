import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DerivacionesService } from './derivaciones.service.js';
import { CreateDerivacioneDto } from './dto/create-derivacione.dto.js';
import { UpdateDerivacioneDto } from './dto/update-derivacione.dto.js';

@Controller('derivaciones')
export class DerivacionesController {
  constructor(private readonly derivacionesService: DerivacionesService) {}

  @Post()
  create(@Body() createDerivacioneDto: CreateDerivacioneDto) {
    return this.derivacionesService.create(createDerivacioneDto);
  }

  @Get()
  findAll() {
    return this.derivacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.derivacionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDerivacioneDto: UpdateDerivacioneDto) {
    return this.derivacionesService.update(+id, updateDerivacioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.derivacionesService.remove(+id);
  }
}
