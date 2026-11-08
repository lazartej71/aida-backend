import { PartialType } from '@nestjs/mapped-types';
import { CreateCalendarioAcademicoDto } from './create-calendario-academico.dto.js';

export class UpdateCalendarioAcademicoDto extends PartialType(CreateCalendarioAcademicoDto) {}
