import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

// Datos para crear una pregunta frecuente con su respuesta oficial
export class CreatePreguntasFrecuenteDto {
  @IsString({ message: 'La pregunta debe ser un texto.' })
  @IsNotEmpty({ message: 'La pregunta es obligatoria.' })
  @MaxLength(300, {
    message: 'La pregunta no puede superar los 300 caracteres.',
  })
  pregunta: string;

  @IsString({ message: 'La respuesta debe ser un texto.' })
  @IsNotEmpty({ message: 'La respuesta es obligatoria.' })
  @MaxLength(5000, {
    message: 'La respuesta no puede superar los 5000 caracteres.',
  })
  respuesta: string;

  @IsString({ message: 'La categoría debe ser un texto.' })
  @IsNotEmpty({ message: 'La categoría es obligatoria.' })
  @MaxLength(50, {
    message: 'La categoría no puede superar los 50 caracteres.',
  })
  categoria: string;

  // Documento oficial que respalda la respuesta
  @IsOptional()
  @IsInt({ message: 'El id del documento debe ser un número entero.' })
  @Min(1, { message: 'El id del documento debe ser mayor que cero.' })
  documentoId?: number;
}
