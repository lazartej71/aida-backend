import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoConversacion } from '../../../common/enums/estado-conversacion.enum.js';
import { CreateChatDto } from './create-chat.dto.js';

// Además de los campos de creación, una conversación se puede cerrar
export class UpdateChatDto extends PartialType(CreateChatDto) {
  @IsOptional()
  @IsEnum(EstadoConversacion, {
    message: 'El estado debe ser ABIERTA o CERRADA.',
  })
  estado?: EstadoConversacion;
}
