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
import { CalendarioAcademicoService } from './calendario-academico.service.js';
import { CreateCalendarioAcademicoDto } from './dto/create-calendario-academico.dto.js';
import { UpdateCalendarioAcademicoDto } from './dto/update-calendario-academico.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import { Publico } from '../auth/decorators/publico.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
@ApiBearerAuth()
@ApiTags('calendario-academico')
@Controller('calendario-academico')
@Roles('PERSONAL', 'ADMIN')
export class CalendarioAcademicoController {
  constructor(private readonly service: CalendarioAcademicoService) {}
  @Post() create(@Body() dto: CreateCalendarioAcademicoDto) {
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
    @Body() dto: UpdateCalendarioAcademicoDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
