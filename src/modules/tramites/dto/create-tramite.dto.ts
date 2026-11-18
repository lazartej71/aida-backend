import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

// Datos para crear un trámite de los estudiantes
export class CreateTramiteDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(150, { message: 'El nombre no puede superar los 150 caracteres.' })
  nombre: string;

  @IsString({ message: 'La descripción debe ser un texto.' })
  @IsNotEmpty({ message: 'La descripción es obligatoria.' })
  @MaxLength(5000, { message: 'La descripción no puede superar los 5000 caracteres.' })
  descripcion: string;

  @IsOptional()
  @IsString({ message: 'La oficina debe ser un texto.' })
  @MaxLength(100, { message: 'La oficina no puede superar los 100 caracteres.' })
  oficina?: string;

  @IsOptional()
  @IsDateString({}, { message: 'El inicio del plazo debe tener el formato AAAA-MM-DD.' })
  plazoDesde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'El fin del plazo debe tener el formato AAAA-MM-DD.' })
  plazoHasta?: string;

  @IsOptional()
  @IsInt({ message: 'El id del documento debe ser un número entero.' })
  @Min(1, { message: 'El id del documento debe ser mayor que cero.' })
  documentoId?: number;
}
