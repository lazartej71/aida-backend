import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { TipoDocumento } from '../../../common/enums/tipo-documento.enum.js';

// Datos para crear un documento oficial (resolución, ordenanza o plan de estudio)
export class CreateDocumentoDto {
  @IsString({ message: 'El título debe ser un texto.' })
  @IsNotEmpty({ message: 'El título es obligatorio.' })
  @MaxLength(200, { message: 'El título no puede superar los 200 caracteres.' })
  titulo: string;

  @IsEnum(TipoDocumento, {
    message: 'El tipo debe ser RESOLUCION, ORDENANZA, PLAN_DE_ESTUDIO u OTRO.',
  })
  tipo: TipoDocumento;

  @IsOptional()
  @IsString({ message: 'El número debe ser un texto, por ejemplo 2394/2025.' })
  @MaxLength(30, { message: 'El número no puede superar los 30 caracteres.' })
  numero?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'La URL debe ser una dirección web válida (http o https).' })
  url?: string;

  @IsOptional()
  @IsDateString({}, { message: 'El inicio de la vigencia debe tener el formato AAAA-MM-DD.' })
  vigenteDesde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'El fin de la vigencia debe tener el formato AAAA-MM-DD.' })
  vigenteHasta?: string;
}
