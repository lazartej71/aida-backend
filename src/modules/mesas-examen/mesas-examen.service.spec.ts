import { Test, TestingModule } from '@nestjs/testing';
import { MesasExamenService } from './mesas-examen.service.js';

describe('MesasExamenService', () => {
  let service: MesasExamenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MesasExamenService],
    }).compile();

    service = module.get<MesasExamenService>(MesasExamenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
