import { Test } from '@nestjs/testing';
import { IngresoService } from './ingreso.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('IngresoService', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      providers: [IngresoService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(module.get(IngresoService)).toBeDefined();
  });
});
