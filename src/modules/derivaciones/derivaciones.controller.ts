import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { DerivacionesService } from './derivaciones.service.js';
import { CreateDerivacioneDto } from './dto/create-derivacione.dto.js';
import { UpdateDerivacioneDto } from './dto/update-derivacione.dto.js';
import { Roles } from '../auth/acceso.decorator.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';

@ApiBearerAuth()
@ApiTags('derivaciones')
@Controller('derivaciones')
@Roles('PERSONAL', 'ADMIN')
export class DerivacionesController {
  constructor(private readonly derivacionesService: DerivacionesService) {}

  @Post()
  create(@Body() createDerivacioneDto: CreateDerivacioneDto) {
    return this.derivacionesService.create(createDerivacioneDto);
  }

  @Get()
  findAll(@Query() query: ListadoDto) {
    return this.derivacionesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.derivacionesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDerivacioneDto: UpdateDerivacioneDto,
  ) {
    return this.derivacionesService.update(id, updateDerivacioneDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.derivacionesService.remove(id);
  }
}
