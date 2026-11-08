import { Injectable } from '@nestjs/common';
import { CreateMesasExamanDto } from './dto/create-mesas-examan.dto.js';
import { UpdateMesasExamanDto } from './dto/update-mesas-examan.dto.js';

@Injectable()
export class MesasExamenService {
  create(_createMesasExamanDto: CreateMesasExamanDto) {
    return 'This action adds a new mesasExaman';
  }

  findAll() {
    return `This action returns all mesasExamen`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mesasExaman`;
  }

  update(id: number, _updateMesasExamanDto: UpdateMesasExamanDto) {
    return `This action updates a #${id} mesasExaman`;
  }

  remove(id: number) {
    return `This action removes a #${id} mesasExaman`;
  }
}
