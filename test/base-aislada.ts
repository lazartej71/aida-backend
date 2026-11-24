import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { readFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

export async function crearBaseAislada() {
  const db = new PGlite();
  await db.waitReady;
  const root = resolve('prisma/migrations');
  for (const dir of (await readdir(root, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))) {
    await db.exec(
      await readFile(resolve(root, dir.name, 'migration.sql'), 'utf8'),
    );
  }
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
