import { Test } from '@nestjs/testing';
import { PreguntasFrecuentesService } from './preguntas-frecuentes.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('PreguntasFrecuentesService', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      providers: [
        PreguntasFrecuentesService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();
    expect(module.get(PreguntasFrecuentesService)).toBeDefined();
  });
});
