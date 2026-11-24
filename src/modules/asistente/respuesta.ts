export interface Evidencia {
  id: string;
  titulo: string;
  texto: string;
  documentoId?: number;
  url?: string | null;
}
export interface RespuestaAsistente {
  texto: string;
  estrategia: 'DATOS_EXACTOS' | 'RECUPERACION_DOCUMENTAL' | 'ABSTENCION';
  fuentes: Evidencia[];
  derivar: boolean;
  proveedor: string;
  tokensEntrada?: number;
  tokensSalida?: number;
}
