import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto.js';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';

// El cambio de contraseña no forma parte de este recurso.
export class UpdateUsuarioDto extends PartialType(
  OmitType(CreateUsuarioDto, ['password'] as const),
) {
  @IsOptional() @IsIn(['ESTUDIANTE', 'PERSONAL', 'ADMIN']) rol?: string;
  @IsOptional() @IsBoolean() activo?: boolean;
}
