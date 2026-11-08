import { PartialType } from '@nestjs/mapped-types';
import { CreateDerivacioneDto } from './create-derivacione.dto.js';

export class UpdateDerivacioneDto extends PartialType(CreateDerivacioneDto) {}
