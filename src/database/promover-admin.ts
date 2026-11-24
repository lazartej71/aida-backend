import 'dotenv/config';
import { isEmail } from 'class-validator';
import { PrismaService } from '../modules/prisma/prisma.service.js';
const email = process.argv[2]?.trim().toLowerCase();
if (!email || !isEmail(email)) {
  console.error('Uso: npm run usuarios:admin -- correo-del-usuario-registrado');
  process.exitCode = 1;
} else {
  const prisma = new PrismaService();
  try {
    await prisma.usuario.update({
      where: { email },
      data: { rol: 'ADMIN', activo: true, tokenVersion: { increment: 1 } },
    });
    console.log('Administrador habilitado. Debe iniciar sesión nuevamente.');
  } catch {
    console.error(
      'No se pudo promover el usuario. Verificá que esté registrado y la conexión funcione.',
    );
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
