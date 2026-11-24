import { Test, TestingModule } from '@nestjs/testing';
import { DerivacionesController } from './derivaciones.controller.js';
import { DerivacionesService } from './derivaciones.service.js';

describe('DerivacionesController', () => {
  let controller: DerivacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DerivacionesController],
      providers: [DerivacionesService],
    }).compile();

    controller = module.get<DerivacionesController>(DerivacionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
