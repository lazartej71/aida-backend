import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AsistenteService } from '../asistente/asistente.service.js';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: PrismaService, useValue: {} },
        { provide: AsistenteService, useValue: {} },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
