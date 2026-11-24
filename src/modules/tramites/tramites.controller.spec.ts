import { Test } from '@nestjs/testing';
import { TramitesController } from './tramites.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TramitesService } from './tramites.service.js';
describe('TramitesController', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      controllers: [TramitesController],
      providers: [TramitesService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(module.get(TramitesController)).toBeDefined();
  });
});
