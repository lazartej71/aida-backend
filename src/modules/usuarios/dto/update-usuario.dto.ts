import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto.js';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';

// Lo que un administrador puede cambiar de un usuario (PATCH /usuarios/:id).
// Hereda nombre y email de CreateUsuarioDto, todos opcionales y sin la contraseña:
// la contraseña la cambia cada usuario desde su perfil
export class UpdateUsuarioDto extends PartialType(
  OmitType(CreateUsuarioDto, ['password'] as const),
) {
  @IsOptional()
  @IsIn(['ESTUDIANTE', 'PERSONAL', 'ADMIN'], {
    message: 'El rol debe ser ESTUDIANTE, PERSONAL o ADMIN.',
  })
  rol?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser verdadero o falso.' })
  activo?: boolean;
}
