import { Test } from '@nestjs/testing';
import { CalendarioAcademicoService } from './calendario-academico.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('CalendarioAcademicoService', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      providers: [
        CalendarioAcademicoService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();
    expect(module.get(CalendarioAcademicoService)).toBeDefined();
  });
});
