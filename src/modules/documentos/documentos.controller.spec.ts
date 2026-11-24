import { Test } from '@nestjs/testing';
import { DocumentosController } from './documentos.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DocumentosService } from './documentos.service.js';
describe('DocumentosController', () => {
  it('se resuelve con sus dependencias explícitas', async () => {
    const module = await Test.createTestingModule({
      controllers: [DocumentosController],
      providers: [DocumentosService, { provide: PrismaService, useValue: {} }],
    }).compile();
    expect(module.get(DocumentosController)).toBeDefined();
  });
});
