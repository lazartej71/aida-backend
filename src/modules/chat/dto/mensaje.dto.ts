import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Consulta que el estudiante agrega a una conversación (POST /chat/:id/mensajes)
export class MensajeDto {
  @IsString({ message: 'El mensaje debe ser un texto.' })
  @IsNotEmpty({ message: 'El mensaje es obligatorio.' })
  @MaxLength(2000, {
    message: 'El mensaje no puede superar los 2000 caracteres.',
  })
  mensaje: string;
}
