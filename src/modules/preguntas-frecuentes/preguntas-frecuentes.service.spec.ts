import { Test, TestingModule } from '@nestjs/testing';
import { PreguntasFrecuentesService } from './preguntas-frecuentes.service.js';

describe('PreguntasFrecuentesService', () => {
  let service: PreguntasFrecuentesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreguntasFrecuentesService],
    }).compile();

    service = module.get<PreguntasFrecuentesService>(PreguntasFrecuentesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
