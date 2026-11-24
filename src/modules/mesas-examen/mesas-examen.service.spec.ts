import { Test } from '@nestjs/testing';
import { MesasExamenService } from './mesas-examen.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('MesasExamenService', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      providers: [MesasExamenService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(module.get(MesasExamenService)).toBeDefined();
  });
});
