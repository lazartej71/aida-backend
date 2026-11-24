import { Test } from '@nestjs/testing';
import { IngresoController } from './ingreso.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { IngresoService } from './ingreso.service.js';
describe('IngresoController', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      controllers: [IngresoController],
      providers: [IngresoService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(module.get(IngresoController)).toBeDefined();
  });
});
