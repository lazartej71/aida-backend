import { Injectable } from '@nestjs/common';
import { CreateCalendarioAcademicoDto } from './dto/create-calendario-academico.dto.js';
import { UpdateCalendarioAcademicoDto } from './dto/update-calendario-academico.dto.js';

@Injectable()
export class CalendarioAcademicoService {
  create(_createCalendarioAcademicoDto: CreateCalendarioAcademicoDto) {
    return 'This action adds a new calendarioAcademico';
  }

  findAll() {
    return `This action returns all calendarioAcademico`;
  }

  findOne(id: number) {
    return `This action returns a #${id} calendarioAcademico`;
  }

  update(
    id: number,
    _updateCalendarioAcademicoDto: UpdateCalendarioAcademicoDto,
  ) {
    return `This action updates a #${id} calendarioAcademico`;
  }

  remove(id: number) {
    return `This action removes a #${id} calendarioAcademico`;
  }
}
