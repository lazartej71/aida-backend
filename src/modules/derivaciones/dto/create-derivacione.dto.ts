import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Prioridad } from '../../../common/enums/prioridad.enum.js';

// Datos para derivar al personal una consulta que el asistente no pudo responder
export class CreateDerivacioneDto {
  @IsInt({ message: 'El id de la conversación debe ser un número entero.' })
  @Min(1, { message: 'El id de la conversación debe ser mayor que cero.' })
  conversacionId: number;

  @IsString({ message: 'El motivo debe ser un texto.' })
  @IsNotEmpty({ message: 'El motivo es obligatorio.' })
  @MaxLength(2000, {
    message: 'El motivo no puede superar los 2000 caracteres.',
  })
  motivo: string;

  // Si no se indica, la base de datos usa MEDIA
  @IsOptional()
  @IsEnum(Prioridad, { message: 'La prioridad debe ser BAJA, MEDIA o ALTA.' })
  prioridad?: Prioridad;
}
