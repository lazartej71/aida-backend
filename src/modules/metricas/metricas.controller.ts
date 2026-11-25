import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { MetricasService } from './metricas.service.js';
import { ListadoDto } from '../../common/dto/listado.dto.js';
export class PeriodoMetricasDto {
  @Type(() => Number) @IsInt() @Min(1) @Max(365) dias = 30;
}
@ApiBearerAuth()
@ApiTags('metricas')
@Controller('metricas')
@Roles('PERSONAL', 'ADMIN')
export class MetricasController {
  constructor(private readonly service: MetricasService) {}
  @Get('resumen') resumen(@Query() query: PeriodoMetricasDto) {
    return this.service.resumen(query.dias);
  }
  @Get('consultas') consultas(@Query() query: ListadoDto) {
    return this.service.consultas(query);
  }
}
