import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  HttpCode,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { Publico, Roles } from '../auth/acceso.decorator.js';
import { CanalesService } from './canales.service.js';
import { ChatService } from '../chat/chat.service.js';
import { MensajeDto } from '../chat/dto/mensaje.dto.js';
import { Canal } from '../../common/enums/canal.enum.js';
@ApiBearerAuth()
@ApiTags('canales')
@Controller('canales')
@Roles('PERSONAL', 'ADMIN')
export class CanalesController {
  constructor(
    private readonly service: CanalesService,
    private readonly chat: ChatService,
  ) {}
  @Get('estado') estado() {
    return this.service.estado();
  }
  @Get('eventos') eventos() {
    return this.service.eventos();
  }
  @ApiOperation({ security: [] })
  @Publico()
  @Post('web')
  web(@Body() dto: MensajeDto) {
    return this.chat.create({ canal: Canal.WEB, mensaje: dto.mensaje });
  }
  @ApiOperation({ security: [] })
  @Publico()
  @Get('whatsapp')
  @Header('Content-Type', 'text/plain')
  verificar(
    @Query('hub.mode') mode?: string,
    @Query('hub.verify_token') token?: string,
    @Query('hub.challenge') challenge?: string,
  ) {
    return this.service.verificar(mode, token, challenge);
  }
  @ApiOperation({ security: [] })
  @Publico()
  @Post('whatsapp')
  @HttpCode(200)
  recibir(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-hub-signature-256') firma?: string,
  ) {
    return this.service.recibir(req.rawBody, firma);
  }
}
