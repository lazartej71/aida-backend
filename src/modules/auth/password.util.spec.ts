import bcrypt from 'bcrypt';
import { hashPassword, verifyPassword } from './password.util.js';

describe('contraseñas bcrypt', () => {
  it('guarda un hash con costo 12 y comprueba la contraseña original', async () => {
    const password = 'ClaveTP12!2026';
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(bcrypt.getRounds(hash)).toBe(12);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword('otraClave!2026', hash)).toBe(false);
  });

  it('rechaza contraseñas que bcrypt truncaría, contando los bytes UTF-8', async () => {
    await expect(hashPassword('á'.repeat(37))).rejects.toThrow('72 bytes');
  });

  it('no acepta texto plano como si fuera un hash', async () => {
    expect(await verifyPassword('ClaveTP12!2026', 'ClaveTP12!2026')).toBe(
      false,
    );
  });
});
