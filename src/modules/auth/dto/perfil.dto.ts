import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { CreateUsuarioDto } from '../../usuarios/dto/create-usuario.dto.js';

// Datos que el usuario puede cambiar de su propio perfil (PATCH /auth/me).
// OmitType saca la contraseña (se cambia aparte) y PartialType vuelve todo opcional
export class PerfilDto extends PartialType(
  OmitType(CreateUsuarioDto, ['password'] as const),
) {}

// Cambio de contraseña (POST /auth/password): pide la actual para confirmar que es el dueño
export class CambiarPasswordDto {
  @IsString({ message: 'La contraseña actual debe ser un texto.' })
  @MinLength(8, {
    message: 'La contraseña actual debe tener al menos 8 caracteres.',
  })
  @MaxLength(72, {
    message: 'La contraseña actual no puede superar los 72 caracteres.',
  })
  passwordActual: string;

  @IsString({ message: 'La contraseña nueva debe ser un texto.' })
  @MinLength(8, {
    message: 'La contraseña nueva debe tener al menos 8 caracteres.',
  })
  @MaxLength(72, {
    message: 'La contraseña nueva no puede superar los 72 caracteres.',
  })
  passwordNueva: string;
}
