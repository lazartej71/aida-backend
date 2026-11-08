import { Test, TestingModule } from '@nestjs/testing';
import { MesasExamenController } from './mesas-examen.controller.js';
import { MesasExamenService } from './mesas-examen.service.js';

describe('MesasExamenController', () => {
  let controller: MesasExamenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MesasExamenController],
      providers: [MesasExamenService],
    }).compile();

    controller = module.get<MesasExamenController>(MesasExamenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
