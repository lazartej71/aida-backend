import { Test, TestingModule } from '@nestjs/testing';
import { DerivacionesService } from './derivaciones.service.js';

describe('DerivacionesService', () => {
  let service: DerivacionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DerivacionesService],
    }).compile();

    service = module.get<DerivacionesService>(DerivacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
