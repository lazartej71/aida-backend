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
import { DocumentosService } from './documentos.service.js';
import { CreateDocumentoDto } from './dto/create-documento.dto.js';
import { UpdateDocumentoDto } from './dto/update-documento.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
import { Publico } from '../auth/decorators/publico.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ContenidoDocumentoDto } from './dto/contenido-documento.dto.js';
@ApiBearerAuth()
@ApiTags('documentos')
@Controller('documentos')
@Roles('PERSONAL', 'ADMIN')
export class DocumentosController {
  @Post(':id/contenido') indexar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ContenidoDocumentoDto,
  ) {
    return this.service.indexar(id, dto.contenido);
  }
  @Get(':id/versiones') versiones(@Param('id', ParseIntPipe) id: number) {
    return this.service.versiones(id);
  }
  @Get(':id/versiones/:numero') version(
    @Param('id', ParseIntPipe) id: number,
    @Param('numero', ParseIntPipe) numero: number,
  ) {
    return this.service.leerVersion(id, numero);
  }
  constructor(private readonly service: DocumentosService) {}
  @Post() create(@Body() dto: CreateDocumentoDto) {
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
    @Body() dto: UpdateDocumentoDto,
  ) {
    return this.service.update(id, dto);
  }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
