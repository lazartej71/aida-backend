import type { Request } from 'express';

// Datos del usuario que JwtAuthGuard agrega a la petición después de validar el token
export interface Sesion {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  tokenVersion: number;
}

// Una petición HTTP con el usuario ya identificado (req.usuario)
export type PeticionAutenticada = Request & { usuario: Sesion };
