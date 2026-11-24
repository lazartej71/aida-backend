import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { CreateChatDto } from './dto/create-chat.dto.js';
import { UpdateChatDto } from './dto/update-chat.dto.js';
import { Publico, Roles } from '../auth/acceso.decorator.js';
import { MensajeDto } from './dto/mensaje.dto.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';

@ApiBearerAuth()
@ApiTags('chat')
@Controller('chat')
@Roles('PERSONAL', 'ADMIN')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ security: [] })
  @Publico()
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto);
  }

  @Get()
  findAll(@Query() query: ListadoDto) {
    return this.chatService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ security: [] })
  @Publico()
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-conversacion-token') token?: string,
  ) {
    return this.chatService.leerPropia(id, token);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChatDto: UpdateChatDto,
  ) {
    return this.chatService.update(id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.remove(id);
  }
  @Get(':id/gestion') gestion(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.findOne(id);
  }
  @ApiOperation({ security: [] })
  @Publico()
  @Post(':id/mensajes')
  mensaje(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MensajeDto,
    @Headers('x-conversacion-token') token?: string,
  ) {
    return this.chatService.agregarMensaje(id, dto.mensaje, token);
  }
  @ApiOperation({ security: [] })
  @Publico()
  @Post(':id/cerrar')
  cerrar(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-conversacion-token') token?: string,
  ) {
    return this.chatService.cerrarPropia(id, token);
  }
}
