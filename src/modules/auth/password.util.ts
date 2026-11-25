import { BadRequestException } from '@nestjs/common';
import bcrypt from 'bcrypt';

// bcrypt solo tiene en cuenta los primeros 72 bytes de una contraseña: se rechaza
// cualquier contraseña más larga para que no se corte sin avisar
const MAX_PASSWORD_BYTES = 72;

// Encripta la contraseña con bcrypt antes de guardarla. El 12 es el "costo": cuántas
// vueltas hace el algoritmo. Cuanto más alto, más lento de adivinar por fuerza bruta.
// El resultado es un hash irreversible ($2b$12$…): no se puede volver a la contraseña
export async function hashPassword(password: string) {
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
    throw new BadRequestException(
      'La contraseña no puede superar los 72 bytes.',
    );
  }
  return bcrypt.hash(password, 12);
}

// Compara la contraseña que escribió el usuario con el hash guardado.
// bcrypt.compare vuelve a encriptarla con la misma "sal" y compara los resultados
export async function verifyPassword(password: string, passwordHash: string) {
  if (
    Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES ||
    !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(passwordHash)
  ) {
    return false;
  }
  return bcrypt.compare(password, passwordHash);
}
