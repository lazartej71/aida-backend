import { Test } from '@nestjs/testing';
import { InscripcionesService } from './inscripciones.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('InscripcionesService', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      providers: [
        InscripcionesService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();
    expect(module.get(InscripcionesService)).toBeDefined();
  });
});
