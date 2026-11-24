import { IsIn, IsInt, Min } from 'class-validator';
export class CorrelatividadDto {
  @IsInt() @Min(1) requiereId: number;
  @IsIn(['CURSAR', 'RENDIR']) para: string;
  @IsIn(['REGULAR', 'APROBADA']) condicion: string;
}
