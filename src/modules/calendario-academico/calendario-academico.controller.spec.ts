import { Test, TestingModule } from '@nestjs/testing';
import { CalendarioAcademicoController } from './calendario-academico.controller.js';
import { CalendarioAcademicoService } from './calendario-academico.service.js';

describe('CalendarioAcademicoController', () => {
  let controller: CalendarioAcademicoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarioAcademicoController],
      providers: [CalendarioAcademicoService],
    }).compile();

    controller = module.get<CalendarioAcademicoController>(CalendarioAcademicoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
