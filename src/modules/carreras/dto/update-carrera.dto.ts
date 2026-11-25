import { PartialType } from '@nestjs/mapped-types';
import { CreateCarreraDto } from './create-carrera.dto.js';

// Datos para modificar una carrera. PartialType copia las reglas de CreateCarreraDto
// pero vuelve todos los campos opcionales: se envía solo lo que cambia
export class UpdateCarreraDto extends PartialType(CreateCarreraDto) {}
