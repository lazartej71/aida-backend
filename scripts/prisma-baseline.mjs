import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(
  new URL('../node_modules/prisma/build/index.js', import.meta.url),
);
const cwd = fileURLToPath(new URL('../', import.meta.url));

function ejecutar(args) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 45000,
  });
}

// Comprobar la estructura antes de registrar la migración como aplicada.
// No se ejecuta el SQL inicial sobre las tablas existentes.
const diff = ejecutar([
  'migrate',
  'diff',
  '--from-config-datasource',
  '--to-schema',
  'prisma/schema.prisma',
  '--exit-code',
]);

if (diff.status !== 0) {
  console.error(
    diff.status === 2
      ? 'La base difiere de schema.prisma. Revisar las diferencias antes de registrar 0_init.'
      : 'No se pudo comparar la base. Revisá DATABASE_URL, el certificado SSL y la conexión.',
  );
  process.exitCode = 1;
} else {
  const baseline = ejecutar(['migrate', 'resolve', '--applied', '0_init']);
  if (baseline.status !== 0) {
    console.error(
      'No se pudo registrar 0_init. Revisá prisma migrate status; puede estar registrada.',
    );
    process.exitCode = 1;
  } else {
    console.log(
      'Migración 0_init registrada. Se conservaron las tablas y los datos existentes.',
    );
  }
}
