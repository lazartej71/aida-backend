import { Module } from '@nestjs/common';
import { MetricasService } from './metricas.service.js';
import { MetricasController } from './metricas.controller.js';
@Module({ providers: [MetricasService], controllers: [MetricasController] })
export class MetricasModule {}
