import { PartialType } from '@nestjs/mapped-types';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { EstadoDerivacion } from '../../../common/enums/estado-derivacion.enum.js';
import { CreateDerivacioneDto } from './create-derivacione.dto.js';

// Además de los campos de creación, el personal cambia el estado y responde la consulta
export class UpdateDerivacioneDto extends PartialType(CreateDerivacioneDto) {
  @IsOptional()
  @IsEnum(EstadoDerivacion, {
    message: 'El estado debe ser PENDIENTE, EN_CURSO o RESUELTA.',
  })
  estado?: EstadoDerivacion;

  // Para marcar una derivación como RESUELTA hay que enviar la respuesta
  @ValidateIf(
    (dto: UpdateDerivacioneDto) =>
      dto.estado === EstadoDerivacion.RESUELTA || dto.respuesta !== undefined,
  )
  @IsString({ message: 'La respuesta debe ser un texto.' })
  @IsNotEmpty({
    message: 'Para resolver la derivación hay que enviar la respuesta.',
  })
  @MaxLength(5000, {
    message: 'La respuesta no puede superar los 5000 caracteres.',
  })
  respuesta?: string;
}
