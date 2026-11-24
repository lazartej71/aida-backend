import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class MensajeDto {
  @IsString() @IsNotEmpty() @MaxLength(2000) mensaje: string;
}
