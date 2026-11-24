import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TramitesService } from './tramites.service.js';
import { CreateTramiteDto } from './dto/create-tramite.dto.js';
import { UpdateTramiteDto } from './dto/update-tramite.dto.js';

@Controller('tramites')
export class TramitesController {
  constructor(private readonly tramitesService: TramitesService) {}

  @Post()
  create(@Body() createTramiteDto: CreateTramiteDto) {
    return this.tramitesService.create(createTramiteDto);
  }

  @Get()
  findAll() {
    return this.tramitesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tramitesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTramiteDto: UpdateTramiteDto) {
    return this.tramitesService.update(+id, updateTramiteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tramitesService.remove(+id);
  }
}
