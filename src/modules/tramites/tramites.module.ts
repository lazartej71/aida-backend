import { Module } from '@nestjs/common';
import { TramitesService } from './tramites.service.js';
import { TramitesController } from './tramites.controller.js';

@Module({
  controllers: [TramitesController],
  providers: [TramitesService],
})
export class TramitesModule {}
