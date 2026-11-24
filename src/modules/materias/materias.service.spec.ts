import { Test } from '@nestjs/testing';
import { MateriasService } from './materias.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('MateriasService', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      providers: [MateriasService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(module.get(MateriasService)).toBeDefined();
  });
});
