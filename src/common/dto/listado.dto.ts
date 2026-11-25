import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// Parámetros de la URL que aceptan los listados (GET /carreras?pagina=2&limite=10).
// Llegan como texto: @Type(() => Number) los convierte a número antes de validarlos
export class ListadoDto {
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero.' })
  @Min(1, { message: 'La página debe ser 1 o mayor.' })
  pagina = 1;

  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero.' })
  @Min(1, { message: 'El límite debe ser 1 o mayor.' })
  @Max(100, { message: 'El límite no puede superar los 100 registros.' })
  limite = 20;

  @IsOptional()
  @IsString({ message: 'La búsqueda debe ser un texto.' })
  @MaxLength(200, {
    message: 'La búsqueda no puede superar los 200 caracteres.',
  })
  busqueda?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El id de la carrera debe ser un número entero.' })
  @Min(1, { message: 'El id de la carrera debe ser mayor que cero.' })
  carreraId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El id de la materia debe ser un número entero.' })
  @Min(1, { message: 'El id de la materia debe ser mayor que cero.' })
  materiaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El id de la conversación debe ser un número entero.' })
  @Min(1, { message: 'El id de la conversación debe ser mayor que cero.' })
  conversacionId?: number;

  @IsOptional()
  @IsString({ message: 'El tipo debe ser un texto.' })
  @MaxLength(50, { message: 'El tipo no puede superar los 50 caracteres.' })
  tipo?: string;

  @IsOptional()
  @IsString({ message: 'El estado debe ser un texto.' })
  @MaxLength(50, { message: 'El estado no puede superar los 50 caracteres.' })
  estado?: string;

  @IsOptional()
  @IsString({ message: 'La categoría debe ser un texto.' })
  @MaxLength(50, {
    message: 'La categoría no puede superar los 50 caracteres.',
  })
  categoria?: string;
}
