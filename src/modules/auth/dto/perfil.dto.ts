import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { CreateUsuarioDto } from '../../usuarios/dto/create-usuario.dto.js';
export class PerfilDto extends PartialType(
  OmitType(CreateUsuarioDto, ['password'] as const),
) {}
export class CambiarPasswordDto {
  @IsString() @MinLength(8) @MaxLength(72) passwordActual: string;
  @IsString() @MinLength(8) @MaxLength(72) passwordNueva: string;
}
