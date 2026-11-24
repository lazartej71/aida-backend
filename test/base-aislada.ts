import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { readFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import pg from 'pg';

export async function crearBaseAislada() {
  const ciUrl = process.env.CI_DATABASE_URL;
  if (ciUrl) {
    const url = new URL(ciUrl);
    if (
      !['127.0.0.1', 'localhost'].includes(url.hostname) ||
      url.pathname !== '/aida_test'
    ) {
      throw new Error('CI_DATABASE_URL debe apuntar a aida_test en localhost.');
    }
    const client = new pg.Client({ connectionString: ciUrl });
    await client.connect();
    try {
      const { rows } = await client.query(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public'",
      );
      if (rows.length) throw new Error('La base de pruebas debe estar vacía.');
      await aplicarMigraciones((sql) => client.query(sql));
    } finally {
      await client.end();
    }
    // El servicio efímero de CI elimina la base al finalizar el job.
    return { url: ciUrl, cerrar: async () => {} };
  }
  const db = new PGlite();
  await db.waitReady;
  await aplicarMigraciones((sql) => db.exec(sql));
  const server = new PGLiteSocketServer({ db, host: '127.0.0.1', port: 0 });
  await server.start();
  return {
    url: `postgresql://postgres:postgres@${server.getServerConn()}/postgres`,
    cerrar: async () => {
      await server.stop();
      await db.close();
    },
  };
}

async function aplicarMigraciones(exec: (sql: string) => Promise<unknown>) {
  const root = resolve('prisma/migrations');
  for (const dir of (await readdir(root, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))) {
    await exec(
      await readFile(resolve(root, dir.name, 'migration.sql'), 'utf8'),
    );
  }
}
