import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { TipoInscripcion } from '../../../common/enums/tipo-inscripcion.enum.js';

// Datos para crear un período de inscripción
export class CreateInscripcioneDto {
  @IsString({ message: 'La descripción debe ser un texto.' })
  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  @MaxLength(200, {
    message: 'La descripción no puede superar los 200 caracteres.',
  })
  descripcion: string;

  @IsEnum(TipoInscripcion, { message: 'El tipo debe ser CURSADO o EXAMEN.' })
  tipo: TipoInscripcion;

  // Sin nivel, el período vale para todos los niveles
  @IsOptional()
  @IsInt({ message: 'El nivel debe ser un número entero.' })
  @Min(1, { message: 'El nivel debe estar entre 1 y 6.' })
  @Max(6, { message: 'El nivel debe estar entre 1 y 6.' })
  nivel?: number;

  @IsDateString(
    {},
    { message: 'La fecha de inicio debe tener el formato AAAA-MM-DD.' },
  )
  fechaDesde: string;

  @IsDateString(
    {},
    { message: 'La fecha de fin debe tener el formato AAAA-MM-DD.' },
  )
  fechaHasta: string;

  @IsOptional()
  @IsInt({ message: 'El id del documento debe ser un número entero.' })
  @Min(1, { message: 'El id del documento debe ser mayor que cero.' })
  documentoId?: number;
}
