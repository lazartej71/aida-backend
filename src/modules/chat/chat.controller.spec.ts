import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AsistenteService } from '../asistente/asistente.service.js';

describe('ChatController', () => {
  let controller: ChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        ChatService,
        { provide: PrismaService, useValue: {} },
        { provide: AsistenteService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
