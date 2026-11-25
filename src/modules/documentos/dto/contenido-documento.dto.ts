import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Texto de un documento oficial para que el asistente lo pueda citar
// (POST /documentos/:id/contenido). Cada carga crea una versión nueva
export class ContenidoDocumentoDto {
  @IsString({ message: 'El contenido debe ser un texto.' })
  @IsNotEmpty({ message: 'El contenido es obligatorio.' })
  @MaxLength(100000, {
    message: 'El contenido no puede superar los 100000 caracteres.',
  })
  contenido: string;
}
