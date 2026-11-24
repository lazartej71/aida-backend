import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class ContenidoDocumentoDto {
  @IsString() @IsNotEmpty() @MaxLength(100000) contenido: string;
}
