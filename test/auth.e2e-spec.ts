import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/modules/app/app.module.js';
import { PrismaService } from '../src/modules/prisma/prisma.service.js';
import { crearValidacion } from '../src/common/pipes/validacion.pipe.js';
import type { Usuario } from '../src/generated/prisma/client.js';

describe('Autenticación TP12 (HTTP)', () => {
  let app: INestApplication<App>;
  let jwt: JwtService;
  const usuarios = new Map<string, Usuario>();
  const credenciales = {
    nombre: 'Usuario TP12',
    email: 'alumno@example.com',
    password: 'ClaveTP12!2026',
  };
  const secret = 'secreto-solo-para-pruebas-e2e-del-tp12-123456';
  const prisma = {
    usuario: {
      create: vi.fn(
        ({
          data,
        }: {
          data: Pick<Usuario, 'nombre' | 'email' | 'passwordHash'>;
        }) => {
          if (usuarios.has(data.email))
            return Promise.reject({ code: 'P2002' });
          const usuario: Usuario = {
            ...data,
            id: usuarios.size + 1,
            rol: 'ESTUDIANTE',
            activo: true,
            tokenVersion: 0,
            creadoEn: new Date(),
            actualizadoEn: new Date(),
          };
          usuarios.set(data.email, usuario);
          return Promise.resolve({
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            activo: usuario.activo,
            creadoEn: usuario.creadoEn,
            actualizadoEn: usuario.actualizadoEn,
          });
        },
      ),
      findUnique: vi.fn(({ where }: { where: { email: string } }) =>
        Promise.resolve(usuarios.get(where.email) ?? null),
      ),
    },
  };

  beforeAll(async () => {
    vi.stubEnv('JWT_SECRET', secret);
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    jwt = module.get(JwtService);
    app = module.createNestApplication();
    app.useGlobalPipes(crearValidacion());
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    vi.unstubAllEnvs();
  });

  it('registra un usuario normalizando el correo y sin devolver credenciales', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        ...credenciales,
        nombre: '  Usuario TP12  ',
        email: '  ALUMNO@EXAMPLE.COM  ',
      })
      .expect(201);
    expect(response.body).toMatchObject({
      id: 1,
      nombre: credenciales.nombre,
      email: credenciales.email,
    });
    expect(response.body).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('passwordHash');
    const almacenado = usuarios.get(credenciales.email)!;
    expect(
      await bcrypt.compare(credenciales.password, almacenado.passwordHash),
    ).toBe(true);
    expect(prisma.usuario.create).toHaveBeenCalledWith(
      expect.objectContaining({
        select: {
          id: true,
          nombre: true,
          email: true,
          rol: true,
          activo: true,
          creadoEn: true,
          actualizadoEn: true,
        },
      }),
    );
  });

  it('rechaza el correo duplicado aunque cambien sus mayúsculas', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...credenciales, email: 'ALUMNO@example.com' })
      .expect(409);
    expect(usuarios.size).toBe(1);
  });

  it('devuelve un JWT firmado con sub, email y una hora de vigencia', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: ' ALUMNO@EXAMPLE.COM ', password: credenciales.password })
      .expect(200);
    const payload = await jwt.verifyAsync<{
      sub: number;
      email: string;
      iat: number;
      exp: number;
    }>(response.body.access_token, { secret, algorithms: ['HS256'] });
    expect(payload.sub).toBe(1);
    expect(payload.email).toBe(credenciales.email);
    expect(payload.exp - payload.iat).toBe(3600);
    expect(payload).not.toHaveProperty('passwordHash');
    expect(response.body.user).not.toHaveProperty('passwordHash');
    await expect(
      jwt.verifyAsync(`${response.body.access_token}alterado`, { secret }),
    ).rejects.toThrow();
  });

  it('responde igual para un correo inexistente y una contraseña incorrecta', async () => {
    const incorrecta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: credenciales.email, password: 'Incorrecta!2026' })
      .expect(401);
    const inexistente = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'inexistente@example.com',
        password: credenciales.password,
      })
      .expect(401);
    expect(incorrecta.body).toEqual(inexistente.body);
    expect(incorrecta.body).not.toHaveProperty('access_token');
  });

  it.each([
    ['nombre en blanco', { ...credenciales, nombre: '   ' }],
    ['email inválido', { ...credenciales, email: 'sin-arroba' }],
    [
      'password ausente',
      { nombre: credenciales.nombre, email: credenciales.email },
    ],
    ['password corta', { ...credenciales, password: 'corta' }],
    [
      'password de más de 72 bytes',
      { ...credenciales, password: 'á'.repeat(37) },
    ],
    [
      'intento de enviar el hash',
      { ...credenciales, passwordHash: 'hash-inyectado' },
    ],
    ['intento de asignar roles', { ...credenciales, rol: 'ADMIN' }],
  ])('rechaza registro con %s', async (_caso, body) => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(body)
      .expect(400);
  });

  it.each([
    { email: 'incorrecto', password: credenciales.password },
    { email: credenciales.email },
    { email: credenciales.email, password: 12345678 },
  ])('valida el cuerpo de login', async (body) => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send(body)
      .expect(400);
  });

  it('mantiene una única ruta para registrar usuarios', async () => {
    await request(app.getHttpServer())
      .post('/usuarios')
      .send(credenciales)
      .expect(404);
  });

  it('no convierte errores inesperados de la base en errores de credenciales', async () => {
    prisma.usuario.findUnique.mockRejectedValueOnce(
      new Error('Fallo simulado de conexión'),
    );
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: credenciales.email, password: credenciales.password })
      .expect(500);
  });
});
