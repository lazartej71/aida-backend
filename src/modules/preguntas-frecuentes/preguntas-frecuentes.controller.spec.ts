import { Test } from '@nestjs/testing';
import { PreguntasFrecuentesController } from './preguntas-frecuentes.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PreguntasFrecuentesService } from './preguntas-frecuentes.service.js';
describe('PreguntasFrecuentesController', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      controllers: [PreguntasFrecuentesController],
      providers: [
        PreguntasFrecuentesService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();
    expect(module.get(PreguntasFrecuentesController)).toBeDefined();
  });
});
