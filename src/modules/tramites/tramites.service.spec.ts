import { Test } from '@nestjs/testing';
import { TramitesService } from './tramites.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('TramitesService', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      providers: [TramitesService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(module.get(TramitesService)).toBeDefined();
  });
});
