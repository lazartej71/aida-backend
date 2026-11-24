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
  Put,
  Query,
} from '@nestjs/common';
import { MateriasService } from './materias.service.js';
import { CreateMateriaDto } from './dto/create-materia.dto.js';
import { UpdateMateriaDto } from './dto/update-materia.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import { Publico, Roles } from '../auth/acceso.decorator.js';
import { CorrelatividadDto } from './dto/correlatividad.dto.js';
@ApiBearerAuth()
@ApiTags('materias')
@Controller('materias')
@Roles('PERSONAL', 'ADMIN')
export class MateriasController {
  @ApiOperation({ security: [] })
  @Publico()
  @Get(':id/correlatividades')
  correlatividades(@Param('id', ParseIntPipe) id: number) {
    return this.service.correlatividades(id);
  }
  @Put(':id/correlatividades') guardarCorrelatividad(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CorrelatividadDto,
  ) {
    return this.service.guardarCorrelatividad(id, dto);
  }
  @Delete(':id/correlatividades/:requiereId/:para') quitarCorrelatividad(
    @Param('id', ParseIntPipe) id: number,
    @Param('requiereId', ParseIntPipe) requiereId: number,
    @Param('para') para: string,
  ) {
    return this.service.quitarCorrelatividad(id, requiereId, para);
  }
  constructor(private readonly service: MateriasService) {}
  @Post() create(@Body() dto: CreateMateriaDto) {
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
    @Body() dto: UpdateMateriaDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
