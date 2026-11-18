import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { TipoEvento } from '../../../common/enums/tipo-evento.enum.js';

// Datos para crear un evento del calendario académico
export class CreateCalendarioAcademicoDto {
  @IsString({ message: 'El título debe ser un texto.' })
  @IsNotEmpty({ message: 'El título es obligatorio.' })
  @MaxLength(200, { message: 'El título no puede superar los 200 caracteres.' })
  titulo: string;

  @IsEnum(TipoEvento, {
    message: 'El tipo debe ser CLASES, RECESO, SUFICIENCIA, EXAMENES u OTRO.',
  })
  tipo: TipoEvento;

  @IsDateString({}, { message: 'La fecha de inicio debe tener el formato AAAA-MM-DD.' })
  fechaDesde: string;

  // Sin fecha de fin, el evento dura un solo día
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin debe tener el formato AAAA-MM-DD.' })
  fechaHasta?: string;

  @IsOptional()
  @IsInt({ message: 'El id del documento debe ser un número entero.' })
  @Min(1, { message: 'El id del documento debe ser mayor que cero.' })
  documentoId?: number;
}
