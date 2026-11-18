import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Canal } from '../../../common/enums/canal.enum.js';

// Datos para iniciar una conversación: el canal y la primera consulta del estudiante
export class CreateChatDto {
  @IsEnum(Canal, { message: 'El canal debe ser WEB o WHATSAPP.' })
  canal: Canal;

  @IsString({ message: 'El mensaje debe ser un texto.' })
  @IsNotEmpty({ message: 'El mensaje es obligatorio.' })
  @MaxLength(2000, {
    message: 'El mensaje no puede superar los 2000 caracteres.',
  })
  mensaje: string;
}
