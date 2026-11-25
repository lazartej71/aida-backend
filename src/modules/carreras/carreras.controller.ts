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
import { CarrerasService } from './carreras.service.js';
import { CreateCarreraDto } from './dto/create-carrera.dto.js';
import { UpdateCarreraDto } from './dto/update-carrera.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import { Publico } from '../auth/decorators/publico.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
@ApiBearerAuth()
@ApiTags('carreras')
@Controller('carreras')
@Roles('PERSONAL', 'ADMIN')
export class CarrerasController {
  constructor(private readonly service: CarrerasService) {}
  @Post() create(@Body() dto: CreateCarreraDto) {
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
    @Body() dto: UpdateCarreraDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
