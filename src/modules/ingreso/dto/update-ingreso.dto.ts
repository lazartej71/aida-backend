import { PartialType } from '@nestjs/mapped-types';
import { CreateIngresoDto } from './create-ingreso.dto.js';

export class UpdateIngresoDto extends PartialType(CreateIngresoDto) {}
