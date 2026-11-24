import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/modules/app/app.module.js';
import { PrismaService } from '../src/modules/prisma/prisma.service.js';
import { crearValidacion } from '../src/common/pipes/validacion.pipe.js';
import { crearBaseAislada } from './base-aislada.js';

describe('Backend completo con PostgreSQL aislado', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwt: JwtService;
  let base: Awaited<ReturnType<typeof crearBaseAislada>>;
  let adminToken: string;
  let alumnoToken: string;
  let adminId: number;
  let alumnoId: number;
  let carreraId: number;
  let materiaId: number;
  let documentoId: number;
  let chatId: number;
  let chatToken: string;
  let derivacionId: number;
  const password = 'ClaveDePrueba!2026';
  const api = () => request(app.getHttpServer());
  const autorizado = () => ({ Authorization: `Bearer ${adminToken}` });
  const cuerpos = () => ({
    carreras: { nombre: 'Carrera creada por HTTP', tipo: 'PREGRADO' },
    materias: {
      carreraId,
      codigo: 222,
      nombre: 'Materia creada por HTTP',
      nivel: 2,
    },
    'mesas-examen': {
      materiaId,
      turno: 3,
      llamado: 'I',
      fecha: '2035-12-15',
      cierreInscripcion: '2035-12-10',
      documentoId,
    },
    inscripciones: {
      descripcion: 'Periodo por HTTP',
      tipo: 'CURSADO',
      fechaDesde: '2035-02-01',
      fechaHasta: '2035-02-28',
      documentoId,
    },
    'calendario-academico': {
      titulo: 'Evento por HTTP',
      tipo: 'CLASES',
      fechaDesde: '2035-03-01',
      documentoId,
    },
    ingreso: {
      titulo: 'Ingreso por HTTP',
      descripcion: 'Información de ingreso',
      modalidad: 'PRESENCIAL',
    },
    tramites: {
      nombre: 'Trámite por HTTP',
      descripcion: 'Requisitos administrativos',
      documentoId,
    },
    documentos: {
      titulo: 'Documento por HTTP',
      tipo: 'RESOLUCION',
      url: 'https://example.invalid/documento',
    },
    'preguntas-frecuentes': {
      pregunta: 'Pregunta creada por HTTP',
      respuesta: 'Respuesta respaldada',
      categoria: 'General',
      documentoId,
    },
  });

  beforeAll(async () => {
    base = await crearBaseAislada();
    vi.stubEnv('DATABASE_URL', base.url);
    vi.stubEnv('DATABASE_POOL_MAX', '1');
    vi.stubEnv('JWT_SECRET', 'secreto-exclusivo-de-tests-aislados-123456789');
    vi.stubEnv('IA_ENDPOINT', '');
    vi.stubEnv('IA_API_KEY', '');
    vi.stubEnv('WHATSAPP_ACCESS_TOKEN', '');
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication({ logger: false });
    app.useGlobalPipes(crearValidacion());
    await app.init();
    prisma = module.get(PrismaService);
    jwt = module.get(JwtService);
    const passwordHash = await bcrypt.hash(password, 4);
    const admin = await prisma.usuario.create({
      data: {
        nombre: 'Administrador de prueba',
        email: 'admin@example.invalid',
        passwordHash,
        rol: 'ADMIN',
      },
    });
    const alumno = await prisma.usuario.create({
      data: {
        nombre: 'Alumno de prueba',
        email: 'alumno@example.invalid',
        passwordHash,
      },
    });
    adminId = admin.id;
    alumnoId = alumno.id;
    adminToken = await jwt.signAsync({ sub: adminId, version: 0 });
    alumnoToken = await jwt.signAsync({ sub: alumnoId, version: 0 });
    carreraId = (
      await prisma.carrera.create({
        data: { nombre: 'Carrera base', tipo: 'GRADO' },
      })
    ).id;
    materiaId = (
      await prisma.materia.create({
        data: { carreraId, codigo: 1, nombre: 'Materia base', nivel: 1 },
      })
    ).id;
    documentoId = (
      await prisma.documento.create({
        data: {
          titulo: 'Documento base',
          tipo: 'RESOLUCION',
          url: 'https://example.invalid/fuente',
        },
      })
    ).id;
  });
  afterAll(async () => {
    await app?.close();
    await base?.cerrar();
    vi.unstubAllEnvs();
  });

  it('expone estado y comprueba la conexión de salud', async () => {
    const root = await api().get('/').expect(200);
    expect(root.body.estado).toBe('disponible');
    await api()
      .get('/salud')
      .expect(200)
      .expect({ estado: 'ok', baseDeDatos: 'disponible' });
  });

  it.each([
    'carreras',
    'materias',
    'mesas-examen',
    'inscripciones',
    'calendario-academico',
    'ingreso',
    'tramites',
    'documentos',
    'preguntas-frecuentes',
  ] as const)('persiste el CRUD de %s y devuelve JSON', async (ruta) => {
    const created = await api()
      .post(`/${ruta}`)
      .set(autorizado())
      .send(cuerpos()[ruta])
      .expect(201);
    const id = created.body.id;
    expect(id).toBeGreaterThan(0);
    const uno = await api().get(`/${ruta}/${id}`).expect(200);
    expect(uno.body.id).toBe(id);
    const lista = await api().get(`/${ruta}?limite=1`).expect(200);
    expect(lista.body.limite).toBe(1);
    expect(lista.body.total).toBeGreaterThan(0);
    expect(lista.body.datos).toHaveLength(1);
    const patch = await api()
      .patch(`/${ruta}/${id}`)
      .set(autorizado())
      .send({})
      .expect(200);
    expect(patch.body.id).toBe(id);
    await api().delete(`/${ruta}/${id}`).set(autorizado()).expect(200);
    await api().get(`/${ruta}/${id}`).expect(404);
  });

  it('protege escrituras por sesión y rol', async () => {
    await api().post('/carreras').send(cuerpos().carreras).expect(401);
    await api()
      .post('/carreras')
      .set('Authorization', `Bearer ${alumnoToken}`)
      .send(cuerpos().carreras)
      .expect(403);
    await api().get('/usuarios').expect(401);
    await api()
      .get('/usuarios')
      .set('Authorization', `Bearer ${alumnoToken}`)
      .expect(403);
    const lista = await api().get('/usuarios').set(autorizado()).expect(200);
    expect(JSON.stringify(lista.body)).not.toMatch(/password|tokenVersion/);
  });

  it('rechaza paginación e identificadores inválidos', async () => {
    await api().get('/carreras/abc').expect(400);
    await api().get('/carreras?pagina=0').expect(400);
    await api().get('/carreras?limite=101').expect(400);
  });

  it('valida campos adicionales, tipos y fechas', async () => {
    await api()
      .post('/carreras')
      .set(autorizado())
      .send({ ...cuerpos().carreras, rol: 'ADMIN' })
      .expect(400);
    await api()
      .post('/materias')
      .set(autorizado())
      .send({ ...cuerpos().materias, nivel: 'dos' })
      .expect(400);
    await api()
      .post('/mesas-examen')
      .set(autorizado())
      .send({ ...cuerpos()['mesas-examen'], fecha: '2035-02-30' })
      .expect(400);
    await api()
      .post('/mesas-examen')
      .set(autorizado())
      .send({ ...cuerpos()['mesas-examen'], cierreInscripcion: '2035-12-20' })
      .expect(400);
  });

  it('valida el rango al actualizar una sola fecha sin perder el estado anterior', async () => {
    const doc = await prisma.documento.create({
      data: {
        titulo: 'Vigencia',
        tipo: 'OTRO',
        vigenteDesde: new Date('2030-01-01'),
        vigenteHasta: new Date('2030-12-31'),
      },
    });
    await api()
      .patch(`/documentos/${doc.id}`)
      .set(autorizado())
      .send({ vigenteHasta: '2029-01-01' })
      .expect(400);
    expect(
      (
        await prisma.documento.findUniqueOrThrow({ where: { id: doc.id } })
      ).vigenteHasta
        ?.toISOString()
        .slice(0, 10),
    ).toBe('2030-12-31');
  });

  it('traduce unicidad y relaciones en errores HTTP sin filtrar SQL', async () => {
    const dup = await api()
      .post('/carreras')
      .set(autorizado())
      .send({ nombre: 'Carrera base', tipo: 'GRADO' })
      .expect(409);
    expect(JSON.stringify(dup.body)).not.toMatch(
      /SELECT|INSERT|password|connectionString/,
    );
    await api()
      .post('/materias')
      .set(autorizado())
      .send({ ...cuerpos().materias, carreraId: 999999 })
      .expect(409);
    await api().delete(`/carreras/${carreraId}`).set(autorizado()).expect(409);
  });

  it('gestiona correlatividades y rechaza ciclos y materias de otra carrera', async () => {
    const m2 = await prisma.materia.create({
      data: { carreraId, codigo: 2, nombre: 'Segunda materia', nivel: 2 },
    });
    await api()
      .put(`/materias/${m2.id}/correlatividades`)
      .set(autorizado())
      .send({ requiereId: materiaId, para: 'CURSAR', condicion: 'APROBADA' })
      .expect(200);
    const lista = await api()
      .get(`/materias/${m2.id}/correlatividades`)
      .expect(200);
    expect(lista.body[0].requiere.id).toBe(materiaId);
    await api()
      .put(`/materias/${materiaId}/correlatividades`)
      .set(autorizado())
      .send({ requiereId: m2.id, para: 'CURSAR', condicion: 'REGULAR' })
      .expect(400);
    await api()
      .put(`/materias/${m2.id}/correlatividades`)
      .set(autorizado())
      .send({ requiereId: m2.id, para: 'RENDIR', condicion: 'APROBADA' })
      .expect(400);
    await api()
      .delete(`/materias/${m2.id}/correlatividades/${materiaId}/CURSAR`)
      .set(autorizado())
      .expect(200);
  });

  it('indexa contenido, conserva versiones y responde con la versión vigente', async () => {
    await api()
      .post(`/documentos/${documentoId}/contenido`)
      .set(autorizado())
      .send({
        contenido:
          'El protocolo orbital constancia indica presentar el formulario azul.',
      })
      .expect(201);
    await api()
      .post(`/documentos/${documentoId}/contenido`)
      .set(autorizado())
      .send({
        contenido:
          'El protocolo orbital constancia indica presentar el formulario verde.',
      })
      .expect(201);
    const versiones = await api()
      .get(`/documentos/${documentoId}/versiones`)
      .set(autorizado())
      .expect(200);
    expect(versiones.body).toHaveLength(2);
    const anterior = await api()
      .get(`/documentos/${documentoId}/versiones/1`)
      .set(autorizado())
      .expect(200);
    expect(anterior.body.contenido).toContain('azul');
    const chat = await api()
      .post('/chat')
      .send({ canal: 'WEB', mensaje: 'protocolo orbital constancia' })
      .expect(201);
    expect(chat.body.estrategia).toBe('RECUPERACION_DOCUMENTAL');
    expect(chat.body.respuesta).toContain('verde');
    expect(chat.body.fuentes[0].documentoId).toBe(documentoId);
  });

  it('inicia una conversación con datos reales y un token privado', async () => {
    const chat = await api()
      .post('/chat')
      .send({ canal: 'WEB', mensaje: 'Qué carreras hay' })
      .expect(201);
    chatId = chat.body.id;
    chatToken = chat.body.tokenConversacion;
    expect(chat.body.estrategia).toBe('DATOS_EXACTOS');
    expect(chat.body.respuesta).toContain('Carrera base');
    expect(chat.body).not.toHaveProperty('accesoHash');
    expect(chat.body.mensajes.map((m: { rol: string }) => m.rol)).toEqual([
      'ESTUDIANTE',
      'ASISTENTE',
    ]);
    await api().get(`/chat/${chatId}`).expect(403);
    await api()
      .get(`/chat/${chatId}`)
      .set('x-conversacion-token', 'ajeno')
      .expect(403);
    const propia = await api()
      .get(`/chat/${chatId}`)
      .set('x-conversacion-token', chatToken)
      .expect(200);
    expect(propia.body.id).toBe(chatId);
  });

  it('se abstiene y deriva sin duplicar derivaciones pendientes', async () => {
    const res = await api()
      .post(`/chat/${chatId}/mensajes`)
      .set('x-conversacion-token', chatToken)
      .send({ mensaje: 'Quiero consultar sobre zeppelines intergalácticos' })
      .expect(201);
    expect(res.body.estrategia).toBe('ABSTENCION');
    expect(res.body.derivada).toBe(true);
    await api()
      .post(`/chat/${chatId}/mensajes`)
      .set('x-conversacion-token', chatToken)
      .send({ mensaje: 'Otra pregunta sin evidencia sobre planetas remotos' })
      .expect(201);
    const derivaciones = await prisma.derivacion.findMany({
      where: { conversacionId: chatId },
    });
    expect(derivaciones).toHaveLength(1);
    derivacionId = derivaciones[0].id;
  });

  it('resuelve una derivación con respuesta y fecha y la agrega al chat', async () => {
    await api()
      .patch(`/derivaciones/${derivacionId}`)
      .set(autorizado())
      .send({ estado: 'RESUELTA' })
      .expect(400);
    const res = await api()
      .patch(`/derivaciones/${derivacionId}`)
      .set(autorizado())
      .send({
        estado: 'RESUELTA',
        respuesta: 'Respuesta del personal de prueba',
      })
      .expect(200);
    expect(res.body.resueltaEn).toBeTruthy();
    const mensajes = await prisma.mensaje.findMany({
      where: { conversacionId: chatId, rol: 'ASISTENTE' },
    });
    expect(
      mensajes.some((m) =>
        m.texto.includes('Respuesta del personal de prueba'),
      ),
    ).toBe(true);
    await api()
      .post(`/chat/${chatId}/cerrar`)
      .set('x-conversacion-token', chatToken)
      .expect(201);
    await api()
      .post(`/chat/${chatId}/mensajes`)
      .set('x-conversacion-token', chatToken)
      .send({ mensaje: 'hola' })
      .expect(400);
  });

  it('reporta métricas reales y el estado de proveedores sin simular disponibilidad', async () => {
    const metricas = await api()
      .get('/metricas/resumen?dias=30')
      .set(autorizado())
      .expect(200);
    expect(metricas.body.rendimiento._count._all).toBeGreaterThan(0);
    expect(metricas.body.costoEstimado).toBeNull();
    await api()
      .get('/metricas/resumen')
      .set('Authorization', `Bearer ${alumnoToken}`)
      .expect(403);
    const estado = await api().get('/ia/estado').set(autorizado()).expect(200);
    expect(estado.body.proveedorExterno.configurado).toBe(false);
    await api().post('/canales/whatsapp').send({}).expect(503);
    await api()
      .post('/chat')
      .send({ canal: 'WHATSAPP', mensaje: 'hola' })
      .expect(400);
  });

  it('rechaza tokens falsificados, vencidos o con roles que no corresponden a la base', async () => {
    await api()
      .get('/auth/me')
      .set('Authorization', 'Bearer basura')
      .expect(401);
    const vencido = await jwt.signAsync(
      { sub: alumnoId, version: 0 },
      { expiresIn: '-1s' },
    );
    await api()
      .get('/auth/me')
      .set('Authorization', `Bearer ${vencido}`)
      .expect(401);
    const rolFalso = await jwt.signAsync({
      sub: alumnoId,
      version: 0,
      rol: 'ADMIN',
    });
    await api()
      .get('/usuarios')
      .set('Authorization', `Bearer ${rolFalso}`)
      .expect(403);
  });

  it('conserva al menos un administrador activo', async () => {
    await api()
      .patch(`/usuarios/${adminId}`)
      .set(autorizado())
      .send({ activo: false })
      .expect(400);
    await api().delete(`/usuarios/${adminId}`).set(autorizado()).expect(400);
  });

  it('cambia la contraseña y revoca las sesiones anteriores', async () => {
    const user = await prisma.usuario.create({
      data: {
        nombre: 'Cambio de clave',
        email: 'clave@example.invalid',
        passwordHash: await bcrypt.hash(password, 4),
      },
    });
    const token = await jwt.signAsync({ sub: user.id, version: 0 });
    await api()
      .post('/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        passwordActual: 'Incorrecta!2026',
        passwordNueva: 'ClaveNueva!2026',
      })
      .expect(401);
    await api()
      .post('/auth/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ passwordActual: password, passwordNueva: 'ClaveNueva!2026' })
      .expect(200);
    await api()
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
    await api()
      .post('/auth/login')
      .send({ email: user.email, password })
      .expect(401);
    await api()
      .post('/auth/login')
      .send({ email: user.email, password: 'ClaveNueva!2026' })
      .expect(200);
  });

  it('impide elevar el rol mediante el perfil y respeta la desactivación de cuentas', async () => {
    await api()
      .patch('/auth/me')
      .set('Authorization', `Bearer ${alumnoToken}`)
      .send({ rol: 'ADMIN' })
      .expect(400);
    const user = await prisma.usuario.create({
      data: {
        nombre: 'Cuenta inactiva',
        email: 'inactivo@example.invalid',
        passwordHash: await bcrypt.hash(password, 4),
      },
    });
    const token = await jwt.signAsync({ sub: user.id, version: 0 });
    await api()
      .patch(`/usuarios/${user.id}`)
      .set(autorizado())
      .send({ activo: false })
      .expect(200);
    await api()
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
    await api()
      .post('/auth/login')
      .send({ email: user.email, password })
      .expect(401);
  });

  it('no usa documentos vencidos como evidencia', async () => {
    const doc = await prisma.documento.create({
      data: {
        titulo: 'Archivo zeppelin obsoleto',
        tipo: 'OTRO',
        vigenteHasta: new Date('2000-01-01'),
      },
    });
    await api()
      .post(`/documentos/${doc.id}/contenido`)
      .set(autorizado())
      .send({
        contenido:
          'Archivo zeppelin obsoleto indica un trámite que ya no está vigente.',
      })
      .expect(201);
    const chat = await api()
      .post('/chat')
      .send({ canal: 'WEB', mensaje: 'archivo zeppelin obsoleto' })
      .expect(201);
    expect(chat.body.estrategia).toBe('ABSTENCION');
    expect(chat.body.fuentes).toHaveLength(0);
  });

  it('rechaza nombres formados únicamente por espacios', async () => {
    await api()
      .post('/carreras')
      .set(autorizado())
      .send({ nombre: '   ', tipo: 'GRADO' })
      .expect(400);
  });

  it('el logout invalida el JWT en las solicitudes siguientes', async () => {
    await api()
      .get('/auth/me')
      .set('Authorization', `Bearer ${alumnoToken}`)
      .expect(200);
    await api()
      .post('/auth/logout')
      .set('Authorization', `Bearer ${alumnoToken}`)
      .expect(200);
    await api()
      .get('/auth/me')
      .set('Authorization', `Bearer ${alumnoToken}`)
      .expect(401);
  });
});
