import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ModalidadIngreso } from '../../../common/enums/modalidad-ingreso.enum.js';

// Datos para crear información para ingresantes (seminario, pruebas de suficiencia, requisitos)
export class CreateIngresoDto {
  @IsString({ message: 'El título debe ser un texto.' })
  @IsNotEmpty({ message: 'El título es obligatorio.' })
  @MaxLength(200, { message: 'El título no puede superar los 200 caracteres.' })
  titulo: string;

  @IsString({ message: 'La descripción debe ser un texto.' })
  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  @MaxLength(5000, {
    message: 'La descripción no puede superar los 5000 caracteres.',
  })
  descripcion: string;

  @IsOptional()
  @IsEnum(ModalidadIngreso, {
    message: 'La modalidad debe ser PRESENCIAL o LIBRE.',
  })
  modalidad?: ModalidadIngreso;

  @IsOptional()
  @IsDateString(
    {},
    {
      message: 'El inicio de la inscripción debe tener el formato AAAA-MM-DD.',
    },
  )
  inscripcionDesde?: string;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'El fin de la inscripción debe tener el formato AAAA-MM-DD.' },
  )
  inscripcionHasta?: string;
}
