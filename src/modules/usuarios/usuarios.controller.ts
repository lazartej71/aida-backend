import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';

// Administración de usuarios. Decoradores de la clase:
// @Controller('usuarios') define la ruta base (/usuarios);
// @Roles('ADMIN') hace que todas sus rutas sean solo para administradores;
// @ApiTags y @ApiBearerAuth agrupan y documentan las rutas en Swagger (/docs).
// No hay ruta para crear usuarios: cada uno se registra con /auth/register
@ApiBearerAuth()
@ApiTags('usuarios')
@Controller('usuarios')
@Roles('ADMIN')
export class UsuariosController {
  // Inyección de dependencias: Nest crea UsuariosService y lo pasa al constructor
  constructor(private readonly usuariosService: UsuariosService) {}

  // GET /usuarios?pagina=1&limite=20&busqueda=juan
  // @Query toma los parámetros de la URL y los valida con ListadoDto
  @Get()
  findAll(@Query() query: ListadoDto) {
    return this.usuariosService.findAll(query);
  }

  // GET /usuarios/:id. ParseIntPipe convierte el id a número y responde 400 si no lo es
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  // PATCH /usuarios/:id. @Body toma el cuerpo del pedido y lo valida con UpdateUsuarioDto
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  // DELETE /usuarios/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}
