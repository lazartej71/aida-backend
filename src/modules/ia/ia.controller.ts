import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { IaService } from './ia.service.js';

// Estado del proveedor externo de IA (si está configurado o no). Solo para el personal
@ApiBearerAuth()
@ApiTags('ia')
@Controller('ia')
@Roles('PERSONAL', 'ADMIN')
export class IaController {
  constructor(private readonly service: IaService) {}

  @Get('estado')
  estado() {
    return this.service.estado();
  }
}
