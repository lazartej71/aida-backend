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
import { IngresoService } from './ingreso.service.js';
import { CreateIngresoDto } from './dto/create-ingreso.dto.js';
import { UpdateIngresoDto } from './dto/update-ingreso.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import { Publico } from '../auth/decorators/publico.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
@ApiBearerAuth()
@ApiTags('ingreso')
@Controller('ingreso')
@Roles('PERSONAL', 'ADMIN')
export class IngresoController {
  constructor(private readonly service: IngresoService) {}
  @Post() create(@Body() dto: CreateIngresoDto) {
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
    @Body() dto: UpdateIngresoDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
