import { Test } from '@nestjs/testing';
import { InscripcionesController } from './inscripciones.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { InscripcionesService } from './inscripciones.service.js';
describe('InscripcionesController', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      controllers: [InscripcionesController],
      providers: [
        InscripcionesService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();
    expect(module.get(InscripcionesController)).toBeDefined();
  });
});
