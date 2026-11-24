import { Injectable } from '@nestjs/common';
import type { Evidencia } from '../../asistente/respuesta.js';
import { SELECCION_EVIDENCIA } from '../prompts/seleccion.js';
// Contrato del adaptador: POST { consulta, evidencias } -> { evidenciaId }.
// Solo permite seleccionar evidencia existente; el proveedor no redacta datos oficiales.
@Injectable()
export class HttpIaProvider {
  estado() {
    let valido = false;
    try {
      valido =
        Boolean(process.env.IA_API_KEY) &&
        new URL(process.env.IA_ENDPOINT ?? '').protocol === 'https:';
    } catch {
      /* Falta configurar un proveedor HTTPS. */
    }
    return {
      configurado: valido,
      contrato: 'seleccion-evidencia-v1',
    };
  }
  async seleccionar(
    consulta: string,
    evidencias: Evidencia[],
  ): Promise<string | null> {
    if (!this.estado().configurado) return null;
    const endpoint = new URL(process.env.IA_ENDPOINT!);
    if (endpoint.protocol !== 'https:') return null;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        signal: AbortSignal.timeout(8000),
        redirect: 'error',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${process.env.IA_API_KEY}`,
        },
        body: JSON.stringify({
          instrucciones: SELECCION_EVIDENCIA,
          consulta,
          evidencias,
        }),
      });
      if (
        !response.ok ||
        Number(response.headers.get('content-length') ?? 0) > 10000
      )
        return null;
      if (!response.body) return null;
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let total = 0;
      for (;;) {
        const chunk = await reader.read();
        if (chunk.done) break;
        total += chunk.value.byteLength;
        if (total > 10000) {
          await reader.cancel();
          return null;
        }
        chunks.push(chunk.value);
      }
      const raw = Buffer.concat(chunks).toString('utf8');
      if (raw.length > 10000) return null;
      const result = JSON.parse(raw) as { evidenciaId?: unknown };
      return typeof result.evidenciaId === 'string' &&
        evidencias.some((e) => e.id === result.evidenciaId)
        ? result.evidenciaId
        : null;
    } catch {
      return null;
    }
  }
}
