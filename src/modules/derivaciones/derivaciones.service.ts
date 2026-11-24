import { Injectable } from '@nestjs/common';
import { CreateDerivacioneDto } from './dto/create-derivacione.dto.js';
import { UpdateDerivacioneDto } from './dto/update-derivacione.dto.js';

@Injectable()
export class DerivacionesService {
  create(_createDerivacioneDto: CreateDerivacioneDto) {
    return 'This action adds a new derivacione';
  }

  findAll() {
    return `This action returns all derivaciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} derivacione`;
  }

  update(id: number, _updateDerivacioneDto: UpdateDerivacioneDto) {
    return `This action updates a #${id} derivacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} derivacione`;
  }
}
