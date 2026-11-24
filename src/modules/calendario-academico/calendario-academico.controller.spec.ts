import { Test } from '@nestjs/testing';
import { CalendarioAcademicoController } from './calendario-academico.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CalendarioAcademicoService } from './calendario-academico.service.js';
describe('CalendarioAcademicoController', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      controllers: [CalendarioAcademicoController],
      providers: [
        CalendarioAcademicoService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();
    expect(module.get(CalendarioAcademicoController)).toBeDefined();
  });
});
