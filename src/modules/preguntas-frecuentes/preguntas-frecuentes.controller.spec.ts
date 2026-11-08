import { Test, TestingModule } from '@nestjs/testing';
import { PreguntasFrecuentesController } from './preguntas-frecuentes.controller.js';
import { PreguntasFrecuentesService } from './preguntas-frecuentes.service.js';

describe('PreguntasFrecuentesController', () => {
  let controller: PreguntasFrecuentesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreguntasFrecuentesController],
      providers: [PreguntasFrecuentesService],
    }).compile();

    controller = module.get<PreguntasFrecuentesController>(PreguntasFrecuentesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
