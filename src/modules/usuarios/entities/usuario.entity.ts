// Representación pública: las credenciales no forman parte de la respuesta.
export class Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}
