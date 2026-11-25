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
import { PreguntasFrecuentesService } from './preguntas-frecuentes.service.js';
import { CreatePreguntasFrecuenteDto } from './dto/create-preguntas-frecuente.dto.js';
import { UpdatePreguntasFrecuenteDto } from './dto/update-preguntas-frecuente.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import { Publico } from '../auth/decorators/publico.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
@ApiBearerAuth()
@ApiTags('preguntas-frecuentes')
@Controller('preguntas-frecuentes')
@Roles('PERSONAL', 'ADMIN')
export class PreguntasFrecuentesController {
  constructor(private readonly service: PreguntasFrecuentesService) {}
  @Post() create(@Body() dto: CreatePreguntasFrecuenteDto) {
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
    @Body() dto: UpdatePreguntasFrecuenteDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
