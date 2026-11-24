import { crearPool } from './pool.js';

describe('configuración PostgreSQL', () => {
  it('rechaza una URL inválida sin revelar su contenido', () => {
    expect(() => crearPool('contraseña-privada')).toThrow(
      'DATABASE_URL no es una URL válida.',
    );
  });

  it('rechaza una URL de la API HTTP de Supabase', () => {
    expect(() => crearPool('https://ejemplo.supabase.co')).toThrow(
      'DATABASE_URL debe ser una conexión PostgreSQL.',
    );
  });

  it('mantiene la verificación SSL aunque la URL de Supabase intente desactivarla', async () => {
    const pool = crearPool(
      'postgresql://postgres:ejemplo@ejemplo.pooler.supabase.com:5432/postgres?sslmode=disable',
    );
    expect(
      new URL(pool.options.connectionString!).searchParams.get('sslmode'),
    ).toBe('verify-full');
    await pool.end();
  });
});
