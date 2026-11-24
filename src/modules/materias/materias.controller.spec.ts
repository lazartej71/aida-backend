import { Test } from '@nestjs/testing';
import { MateriasController } from './materias.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { MateriasService } from './materias.service.js';
describe('MateriasController', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      controllers: [MateriasController],
      providers: [MateriasService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(module.get(MateriasController)).toBeDefined();
  });
});
