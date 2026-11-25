import { Module } from '@nestjs/common';
import { IaController } from './ia.controller.js';
import { IaService } from './ia.service.js';
import { HttpIaProvider } from './proveedores/http.provider.js';

// Aísla al proveedor de IA (opcional): el resto del sistema solo conoce IaService
@Module({
  providers: [IaService, HttpIaProvider],
  controllers: [IaController],
  exports: [IaService],
})
export class IaModule {}
