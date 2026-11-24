import { Test } from '@nestjs/testing';
import { MesasExamenController } from './mesas-examen.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { MesasExamenService } from './mesas-examen.service.js';
describe('MesasExamenController', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      controllers: [MesasExamenController],
      providers: [MesasExamenService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(module.get(MesasExamenController)).toBeDefined();
  });
});
