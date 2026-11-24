import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InscripcionesService } from './inscripciones.service.js';
import { CreateInscripcioneDto } from './dto/create-inscripcione.dto.js';
import { UpdateInscripcioneDto } from './dto/update-inscripcione.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import { Publico, Roles } from '../auth/acceso.decorator.js';
@ApiBearerAuth()
@ApiTags('inscripciones')
@Controller('inscripciones')
@Roles('PERSONAL', 'ADMIN')
export class InscripcionesController {
  constructor(private readonly service: InscripcionesService) {}
  @Post() create(@Body() dto: CreateInscripcioneDto) {
    return this.service.create(dto);
  }
  @ApiOperation({ security: [] })
  @Publico()
  @Get()
  findAll(@Query() query: ListadoDto) {
    return this.service.findAll(query);
  }
  @ApiOperation({ security: [] })
  @Publico()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
  @Patch(':id') update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInscripcioneDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
