import { BadRequestException } from '@nestjs/common';
import bcrypt from 'bcrypt';

const MAX_PASSWORD_BYTES = 72;

export async function hashPassword(password: string) {
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) {
    throw new BadRequestException(
      'La contraseña no puede superar los 72 bytes.',
    );
  }
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  if (
    Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES ||
    !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(passwordHash)
  ) {
    return false;
  }
  return bcrypt.compare(password, passwordHash);
}
