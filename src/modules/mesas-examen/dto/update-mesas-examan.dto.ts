import { PartialType } from '@nestjs/mapped-types';
import { CreateMesasExamanDto } from './create-mesas-examan.dto.js';

export class UpdateMesasExamanDto extends PartialType(CreateMesasExamanDto) {}
