import { PartialType } from '@nestjs/mapped-types';
import { CreatePreguntasFrecuenteDto } from './create-preguntas-frecuente.dto.js';

export class UpdatePreguntasFrecuenteDto extends PartialType(CreatePreguntasFrecuenteDto) {}
