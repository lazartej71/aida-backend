import { IsDateString, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { LlamadoExamen } from '../../../common/enums/llamado-examen.enum.js';

// Datos para crear una mesa de examen: un llamado de un turno para una materia
export class CreateMesasExamanDto {
  @IsInt({ message: 'El id de la materia debe ser un número entero.' })
  @Min(1, { message: 'El id de la materia debe ser mayor que cero.' })
  materiaId: number;

  @IsInt({ message: 'El turno debe ser un número entero.' })
  @Min(1, { message: 'El turno debe estar entre 1 y 10.' })
  @Max(10, { message: 'El turno debe estar entre 1 y 10.' })
  turno: number;

  @IsEnum(LlamadoExamen, { message: 'El llamado debe ser I, II o III.' })
  llamado: LlamadoExamen;

  @IsDateString({}, { message: 'La fecha debe tener el formato AAAA-MM-DD.' })
  fecha: string;

  @IsDateString({}, { message: 'El cierre de inscripción debe tener el formato AAAA-MM-DD.' })
  cierreInscripcion: string;

  @IsOptional()
  @IsInt({ message: 'El id del documento debe ser un número entero.' })
  @Min(1, { message: 'El id del documento debe ser mayor que cero.' })
  documentoId?: number;
}
