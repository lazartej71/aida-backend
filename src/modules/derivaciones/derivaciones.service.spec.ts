import { Test, TestingModule } from '@nestjs/testing';
import { DerivacionesService } from './derivaciones.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('DerivacionesService', () => {
  let service: DerivacionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DerivacionesService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<DerivacionesService>(DerivacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
