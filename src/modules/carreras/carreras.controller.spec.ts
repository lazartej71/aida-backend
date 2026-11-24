import { Test } from '@nestjs/testing';
import { CarrerasController } from './carreras.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CarrerasService } from './carreras.service.js';
describe('CarrerasController', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      controllers: [CarrerasController],
      providers: [CarrerasService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(module.get(CarrerasController)).toBeDefined();
  });
});
