import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

// Datos para iniciar sesión (POST /auth/login)
export class LoginAuthDto {
  // @Transform corre antes de validar: quita espacios y pasa el correo a minúsculas
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail(
    {},
    { message: 'El correo electrónico debe tener un formato válido.' },
  )
  @MaxLength(254, {
    message: 'El correo no puede superar los 254 caracteres.',
  })
  email: string;

  // El máximo de 72 es el límite de bcrypt: lo que pase de ahí no se tendría en cuenta
  @IsString({ message: 'La contraseña debe ser un texto.' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @MaxLength(72, {
    message: 'La contraseña no puede superar los 72 caracteres.',
  })
  password: string;
}
