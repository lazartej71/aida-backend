import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { TipoCarrera } from '../../../common/enums/tipo-carrera.enum.js';

// Datos para crear una carrera
export class CreateCarreraDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(120, { message: 'El nombre no puede superar los 120 caracteres.' })
  nombre: string;

  @IsEnum(TipoCarrera, { message: 'El tipo debe ser GRADO o PREGRADO.' })
  tipo: TipoCarrera;

  @IsOptional()
  @IsInt({ message: 'La duración debe ser un número entero de años.' })
  @Min(1, { message: 'La duración debe ser de al menos 1 año.' })
  @Max(10, { message: 'La duración no puede superar los 10 años.' })
  duracionAnios?: number;

  @IsOptional()
  @IsString({ message: 'El plan debe ser un texto.' })
  @MaxLength(20, { message: 'El plan no puede superar los 20 caracteres.' })
  plan?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo activa debe ser true o false.' })
  activa?: boolean;
}
