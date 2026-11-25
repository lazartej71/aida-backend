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

// Controller de carreras: recibe las peticiones HTTP de /carreras y se las pasa
// al service. No tiene lógica de negocio: solo define rutas, parámetros y permisos.
// @Controller('carreras') es la ruta base. @Roles('PERSONAL', 'ADMIN') vale para
// todas las rutas, salvo las marcadas con @Publico(), que cualquiera puede consultar.
// @ApiTags y @ApiBearerAuth documentan las rutas en Swagger (/docs)
@ApiBearerAuth()
@ApiTags('carreras')
@Controller('carreras')
@Roles('PERSONAL', 'ADMIN')
export class CarrerasController {
  // Inyección de dependencias: Nest crea el CarrerasService y lo pasa acá
  constructor(private readonly service: CarrerasService) {}

  // POST /carreras: crea una carrera. @Body toma el cuerpo y lo valida con CreateCarreraDto
  @Post()
  create(@Body() dto: CreateCarreraDto) {
    return this.service.create(dto);
  }

  // GET /carreras?pagina=1&limite=20&busqueda=sistemas: listado paginado, público
  @ApiOperation({ security: [] })
  @Publico()
  @Get()
  findAll(@Query() query: ListadoDto) {
    return this.service.findAll(query);
  }

  // GET /carreras/:id: una carrera. ParseIntPipe convierte el id a número (400 si no lo es)
  @ApiOperation({ security: [] })
  @Publico()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // PATCH /carreras/:id: modifica solo los campos que se envían (UpdateCarreraDto)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCarreraDto) {
    return this.service.update(id, dto);
  }

  // DELETE /carreras/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
