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
import { MesasExamenService } from './mesas-examen.service.js';
import { CreateMesasExamanDto } from './dto/create-mesas-examan.dto.js';
import { UpdateMesasExamanDto } from './dto/update-mesas-examan.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import { Publico, Roles } from '../auth/acceso.decorator.js';
@ApiBearerAuth()
@ApiTags('mesas-examen')
@Controller('mesas-examen')
@Roles('PERSONAL', 'ADMIN')
export class MesasExamenController {
  constructor(private readonly service: MesasExamenService) {}
  @Post() create(@Body() dto: CreateMesasExamanDto) {
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
    @Body() dto: UpdateMesasExamanDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
