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
import { TramitesService } from './tramites.service.js';
import { CreateTramiteDto } from './dto/create-tramite.dto.js';
import { UpdateTramiteDto } from './dto/update-tramite.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import { Publico, Roles } from '../auth/acceso.decorator.js';
@ApiBearerAuth()
@ApiTags('tramites')
@Controller('tramites')
@Roles('PERSONAL', 'ADMIN')
export class TramitesController {
  constructor(private readonly service: TramitesService) {}
  @Post() create(@Body() dto: CreateTramiteDto) {
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
    @Body() dto: UpdateTramiteDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
