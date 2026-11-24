import { Test } from '@nestjs/testing';
import { DocumentosService } from './documentos.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('DocumentosService', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      providers: [DocumentosService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(module.get(DocumentosService)).toBeDefined();
  });
});
