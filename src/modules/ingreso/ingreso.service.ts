import { Injectable } from '@nestjs/common';
import { CreateIngresoDto } from './dto/create-ingreso.dto.js';
import { UpdateIngresoDto } from './dto/update-ingreso.dto.js';

@Injectable()
export class IngresoService {
  create(_createIngresoDto: CreateIngresoDto) {
    return 'This action adds a new ingreso';
  }

  findAll() {
    return `This action returns all ingreso`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ingreso`;
  }

  update(id: number, _updateIngresoDto: UpdateIngresoDto) {
    return `This action updates a #${id} ingreso`;
  }

  remove(id: number) {
    return `This action removes a #${id} ingreso`;
  }
}
