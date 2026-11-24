import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ListadoDto {
  @Type(() => Number) @IsInt() @Min(1) pagina = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(100) limite = 20;
  @IsOptional() @IsString() @MaxLength(200) busqueda?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) carreraId?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) materiaId?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) conversacionId?: number;
  @IsOptional() @IsString() @MaxLength(50) tipo?: string;
  @IsOptional() @IsString() @MaxLength(50) estado?: string;
  @IsOptional() @IsString() @MaxLength(50) categoria?: string;
}
