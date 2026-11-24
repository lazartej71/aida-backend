import { Injectable } from '@nestjs/common';
import type { Evidencia } from '../asistente/respuesta.js';
import { HttpIaProvider } from './proveedores/http.provider.js';
@Injectable()
export class IaService {
  constructor(private readonly http: HttpIaProvider) {}
  estado() {
    return {
      modo: this.http.estado().configurado
        ? 'HTTP_CON_RESPALDO_LOCAL'
        : 'RECUPERACION_LOCAL',
      proveedorExterno: this.http.estado(),
    };
  }
  async seleccionar(consulta: string, evidencias: Evidencia[]) {
    const id = await this.http.seleccionar(consulta, evidencias);
    return {
      evidencia: evidencias.find((e) => e.id === id) ?? evidencias[0],
      proveedor: id ? 'HTTP' : 'LOCAL',
    };
  }
}
