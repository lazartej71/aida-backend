import pg from 'pg';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function obtenerDatabaseUrl(
  connectionString = process.env.DATABASE_URL,
): string {
  if (!connectionString) {
    throw new Error('Falta DATABASE_URL en el archivo .env del backend.');
  }

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error('DATABASE_URL no es una URL válida.');
  }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('DATABASE_URL debe ser una conexión PostgreSQL.');
  }

  const esSupabase =
    url.hostname.endsWith('.supabase.com') ||
    url.hostname.endsWith('.supabase.co');
  if (esSupabase) {
    url.searchParams.set('sslmode', 'verify-full');
    const certificado = process.env.DATABASE_SSL_CA ?? 'prod-supabase.cer';
    if (process.env.DATABASE_SSL_CA || existsSync(certificado)) {
      url.searchParams.set('sslrootcert', resolve(certificado));
    }
  }

  return url.toString();
}

export function crearPool(
  connectionString = process.env.DATABASE_URL,
): pg.Pool {
  return new pg.Pool({
    connectionString: obtenerDatabaseUrl(connectionString),
    max: 5,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    statement_timeout: 10000,
  });
}
