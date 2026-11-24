import { Injectable } from '@nestjs/common';
import { CreateCarreraDto } from './dto/create-carrera.dto.js';
import { UpdateCarreraDto } from './dto/update-carrera.dto.js';

@Injectable()
export class CarrerasService {
  create(_createCarreraDto: CreateCarreraDto) {
    return 'This action adds a new carrera';
  }

  findAll() {
    return `This action returns all carreras`;
  }

  findOne(id: number) {
    return `This action returns a #${id} carrera`;
  }

  update(id: number, _updateCarreraDto: UpdateCarreraDto) {
    return `This action updates a #${id} carrera`;
  }

  remove(id: number) {
    return `This action removes a #${id} carrera`;
  }
}
