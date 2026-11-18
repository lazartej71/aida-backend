import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// Datos para crear una materia dentro de una carrera
export class CreateMateriaDto {
  @IsInt({ message: 'El id de la carrera debe ser un número entero.' })
  @Min(1, { message: 'El id de la carrera debe ser mayor que cero.' })
  carreraId: number;

  @IsInt({ message: 'El código debe ser un número entero.' })
  @Min(1, { message: 'El código debe ser mayor que cero.' })
  codigo: number;

  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(120, { message: 'El nombre no puede superar los 120 caracteres.' })
  nombre: string;

  @IsInt({ message: 'El nivel debe ser un número entero.' })
  @Min(1, { message: 'El nivel debe estar entre 1 y 6.' })
  @Max(6, { message: 'El nivel debe estar entre 1 y 6.' })
  nivel: number;

  @IsOptional()
  @IsBoolean({ message: 'El campo esElectiva debe ser true o false.' })
  esElectiva?: boolean;
}
