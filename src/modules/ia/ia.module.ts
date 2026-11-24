import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Module } from '@nestjs/common';
import { Roles } from '../auth/acceso.decorator.js';
import { IaService } from './ia.service.js';
import { HttpIaProvider } from './proveedores/http.provider.js';
@ApiBearerAuth()
@ApiTags('ia')
@Controller('ia')
@Roles('PERSONAL', 'ADMIN')
class IaController {
  constructor(private readonly service: IaService) {}
  @Get('estado') estado() {
    return this.service.estado();
  }
}
@Module({
  providers: [IaService, HttpIaProvider],
  controllers: [IaController],
  exports: [IaService],
})
export class IaModule {}
