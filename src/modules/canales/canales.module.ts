import { Module } from '@nestjs/common';
import { ChatModule } from '../chat/chat.module.js';
import { CanalesController } from './canales.controller.js';
import { CanalesService } from './canales.service.js';
@Module({
  imports: [ChatModule],
  controllers: [CanalesController],
  providers: [CanalesService],
})
export class CanalesModule {}
