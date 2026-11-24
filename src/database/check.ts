import { PrismaService } from '../modules/prisma/prisma.service.js';

const tablas = [
  'documentos',
  'carreras',
  'materias',
  'correlatividades',
  'mesas_examen',
  'periodos_inscripcion',
  'eventos_academicos',
  'info_ingreso',
  'tramites',
  'preguntas_frecuentes',
  'conversaciones',
  'mensajes',
  'derivaciones',
];

async function verificar() {
  const prisma = new PrismaService();
  try {
    await prisma.$connect();
    const conteos = await Promise.all([
      prisma.documento.count(),
      prisma.carrera.count(),
      prisma.materia.count(),
      prisma.correlatividad.count(),
      prisma.mesaExamen.count(),
      prisma.periodoInscripcion.count(),
      prisma.eventoAcademico.count(),
      prisma.infoIngreso.count(),
      prisma.tramite.count(),
      prisma.preguntaFrecuente.count(),
      prisma.conversacion.count(),
      prisma.mensaje.count(),
      prisma.derivacion.count(),
    ]);
    console.log('Conexión con Prisma y PostgreSQL correcta.');
    console.table(tablas.map((tabla, i) => ({ tabla, registros: conteos[i] })));
    const rows = await prisma.$queryRaw<{ tabla: string; rls: boolean }[]>`
       SELECT relname AS tabla, relrowsecurity AS rls
       FROM pg_class JOIN pg_namespace ON pg_namespace.oid = relnamespace
       WHERE nspname = 'public' AND relname = ANY(${tablas}::text[]) ORDER BY relname`;
    console.table(rows);
  } finally {
    await prisma.$disconnect();
  }
}

try {
  await verificar();
} catch (error) {
  // No imprimir el error completo: podría contener credenciales o datos internos.
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String(error.code)
      : 'CONFIGURACION';
  const mensajes: Record<string, string> = {
    P1000:
      'Supabase rechazó las credenciales. Revisá el usuario y la contraseña de DATABASE_URL.',
    P1011: 'Revisá el certificado SSL de Supabase (prod-supabase.cer).',
    SELF_SIGNED_CERT_IN_CHAIN:
      'Descargá el certificado SSL desde Database Settings de Supabase y guardalo como prod-supabase.cer en la carpeta del backend.',
    '28P01': 'Revisá la contraseña de DATABASE_URL.',
    '42P01': 'Falta una tabla: revisá la migración en Supabase.',
    ENOTFOUND: 'Revisá el host de DATABASE_URL y la conexión de red.',
    ENETUNREACH: 'Probá la conexión Session pooler (compatible con IPv4).',
    CONFIGURACION: 'Revisá DATABASE_URL y la conexión de red.',
  };
  console.error(
    `No se pudo verificar la base (${code}). ${mensajes[code] ?? 'Revisá la conexión, el certificado SSL y la configuración de Supabase.'}`,
  );
  process.exitCode = 1;
}
