import { Test, TestingModule } from '@nestjs/testing';
import { CarrerasController } from './carreras.controller.js';
import { CarrerasService } from './carreras.service.js';

describe('CarrerasController', () => {
  let controller: CarrerasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarrerasController],
      providers: [CarrerasService],
    }).compile();

    controller = module.get<CarrerasController>(CarrerasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
