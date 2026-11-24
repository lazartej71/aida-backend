import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return { nombre: 'AIda', estado: 'disponible', documentacion: '/docs' };
  }
}
