import { Test } from '@nestjs/testing';
import { CarrerasService } from './carreras.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('CarrerasService', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      providers: [CarrerasService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(module.get(CarrerasService)).toBeDefined();
  });
});
