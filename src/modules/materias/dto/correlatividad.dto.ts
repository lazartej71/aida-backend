import { IsIn, IsInt, Min } from 'class-validator';

// Una correlatividad: la materia que se requiere, para qué y en qué condición
// (PUT /materias/:id/correlatividades)
export class CorrelatividadDto {
  @IsInt({
    message: 'El id de la materia requerida debe ser un número entero.',
  })
  @Min(1, { message: 'El id de la materia requerida debe ser mayor que cero.' })
  requiereId: number;

  @IsIn(['CURSAR', 'RENDIR'], {
    message: 'El campo para debe ser CURSAR o RENDIR.',
  })
  para: string;

  @IsIn(['REGULAR', 'APROBADA'], {
    message: 'La condición debe ser REGULAR o APROBADA.',
  })
  condicion: string;
}
