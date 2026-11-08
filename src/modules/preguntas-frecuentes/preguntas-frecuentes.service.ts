import { Injectable } from '@nestjs/common';
import { CreatePreguntasFrecuenteDto } from './dto/create-preguntas-frecuente.dto.js';
import { UpdatePreguntasFrecuenteDto } from './dto/update-preguntas-frecuente.dto.js';

@Injectable()
export class PreguntasFrecuentesService {
  create(_createPreguntasFrecuenteDto: CreatePreguntasFrecuenteDto) {
    return 'This action adds a new preguntasFrecuente';
  }

  findAll() {
    return `This action returns all preguntasFrecuentes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} preguntasFrecuente`;
  }

  update(
    id: number,
    _updatePreguntasFrecuenteDto: UpdatePreguntasFrecuenteDto,
  ) {
    return `This action updates a #${id} preguntasFrecuente`;
  }

  remove(id: number) {
    return `This action removes a #${id} preguntasFrecuente`;
  }
}
