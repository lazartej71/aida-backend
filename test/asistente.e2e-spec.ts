import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/modules/app/app.module.js';
import { PrismaService } from '../src/modules/prisma/prisma.service.js';
import { crearValidacion } from '../src/common/pipes/validacion.pipe.js';
import { crearBaseAislada } from './base-aislada.js';

// Pruebas del asistente con una base PostgreSQL aislada y datos controlados:
// fechas pasadas (2020) para lo que ya venció y futuras (2035) para lo próximo
describe('Asistente: conversación, datos exactos y abstención', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let base: Awaited<ReturnType<typeof crearBaseAislada>>;
  const api = () => request(app.getHttpServer());
  const preguntar = (mensaje: string) =>
    api().post('/chat').send({ canal: 'WEB', mensaje }).expect(201);

  beforeAll(async () => {
    base = await crearBaseAislada();
    vi.stubEnv('DATABASE_URL', base.url);
    vi.stubEnv('DATABASE_POOL_MAX', '1');
    vi.stubEnv('JWT_SECRET', 'secreto-exclusivo-de-tests-aislados-123456789');
    vi.stubEnv('IA_ENDPOINT', '');
    vi.stubEnv('IA_API_KEY', '');
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication({ logger: false });
    app.useGlobalPipes(crearValidacion());
    await app.init();
    prisma = module.get(PrismaService);

    const calendario = await prisma.documento.create({
      data: {
        titulo: 'Calendario de prueba',
        tipo: 'RESOLUCION',
        numero: '1/2035',
      },
    });
    const documentoId = calendario.id;
    const carrera = await prisma.carrera.create({
      data: { nombre: 'Ingeniería de prueba', tipo: 'GRADO' },
    });
    const fisica1 = await prisma.materia.create({
      data: { carreraId: carrera.id, codigo: 3, nombre: 'Física I', nivel: 1 },
    });
    const fisica2 = await prisma.materia.create({
      data: {
        carreraId: carrera.id,
        codigo: 10,
        nombre: 'Física II',
        nivel: 2,
      },
    });
    await prisma.correlatividad.create({
      data: {
        materiaId: fisica2.id,
        requiereId: fisica1.id,
        para: 'CURSAR',
        condicion: 'REGULAR',
      },
    });
    await prisma.eventoAcademico.createMany({
      data: [
        {
          titulo: '1° turno · Mesa I (cierre de inscripción: 10/05/2035)',
          tipo: 'EXAMENES',
          fechaDesde: new Date('2035-05-14'),
          documentoId,
        },
        {
          titulo: '7° turno · Mesa I (cierre de inscripción: 10/12/2035)',
          tipo: 'EXAMENES',
          fechaDesde: new Date('2035-12-14'),
          documentoId,
        },
        {
          // Mesa futura cuyo cierre de inscripción ya pasó
          titulo: '1° turno · Mesa II (cierre de inscripción: 01/01/2020)',
          tipo: 'EXAMENES',
          fechaDesde: new Date('2035-05-20'),
          documentoId,
        },
        {
          titulo: 'Receso académico de verano',
          tipo: 'RECESO',
          fechaDesde: new Date('2036-01-01'),
          fechaHasta: new Date('2036-02-11'),
          documentoId,
        },
      ],
    });
    // Calendario de licenciaturas y tecnicaturas: mismas fechas, otro cierre de inscripción
    const tecnicaturas = await prisma.documento.create({
      data: {
        titulo: 'Calendario de prueba - Licenciaturas y Tecnicaturas',
        tipo: 'RESOLUCION',
        numero: '2/2035',
      },
    });
    await prisma.eventoAcademico.create({
      data: {
        titulo: '1° turno · Mesa I (cierre de inscripción: 09/05/2035)',
        tipo: 'EXAMENES',
        fechaDesde: new Date('2035-05-14'),
        documentoId: tecnicaturas.id,
      },
    });
    await prisma.tramite.create({
      data: {
        nombre: 'Cambio de plan',
        descripcion: 'Se presenta por nota.',
        plazoDesde: new Date('2020-04-06'),
        plazoHasta: new Date('2020-04-17'),
        documentoId,
      },
    });
    await prisma.periodoInscripcion.create({
      data: {
        descripcion: 'Inscripción al cursado 2020',
        tipo: 'CURSADO',
        fechaDesde: new Date('2020-03-23'),
        fechaHasta: new Date('2020-03-27'),
        documentoId,
      },
    });
    // Pregunta frecuente de otro tema que nombra Física I: no debe usarse para responder mesas
    await prisma.preguntaFrecuente.create({
      data: {
        pregunta: '¿Qué materias tiene el primer nivel?',
        respuesta: 'Física I y otras materias del primer nivel.',
        categoria: 'Plan de estudio',
      },
    });
  });

  afterAll(async () => {
    await app?.close();
    await base?.cerrar();
    vi.unstubAllEnvs();
  });

  it('responde un saludo sin derivar la consulta', async () => {
    const res = await preguntar('Hola');
    expect(res.body.estrategia).toBe('CONVERSACION');
    expect(res.body.derivada).toBe(false);
    expect(res.body.respuesta).toContain('Puedo responderte');
    expect(await prisma.derivacion.count()).toBe(0);
  });

  it('pregunta la materia cuando piden correlativas sin nombrarla', async () => {
    const res = await preguntar('¿Qué correlativas tiene?');
    expect(res.body.estrategia).toBe('CONVERSACION');
    expect(res.body.respuesta).toContain('¿De qué materia');
    expect(res.body.derivada).toBe(false);
  });

  it('responde las correlativas de una materia con datos exactos', async () => {
    const res = await preguntar('Correlativas de Física II');
    expect(res.body.estrategia).toBe('DATOS_EXACTOS');
    expect(res.body.respuesta).toContain(
      'Para cursar: Física I, condición regular.',
    );
  });

  it('sin mesa propia de la materia informa los turnos generales y no la pregunta frecuente', async () => {
    const res = await preguntar('¿Cuándo son las mesas de Física I?');
    expect(res.body.estrategia).toBe('DATOS_EXACTOS');
    expect(res.body.respuesta).toContain(
      'No hay una mesa específica cargada para Física I',
    );
    expect(res.body.respuesta).toContain('14/05/2035');
    expect(res.body.respuesta).not.toContain('primer nivel');
  });

  it('separa los turnos por calendario y, con una materia, muestra solo el de su carrera', async () => {
    const general = await preguntar('¿Cuándo son las próximas mesas?');
    expect(general.body.respuesta).toContain('Carreras de grado:');
    expect(general.body.respuesta).toContain('Licenciaturas y tecnicaturas:');
    const deGrado = await preguntar('mesas de Física I');
    expect(deGrado.body.respuesta).toContain('10/05/2035');
    expect(deGrado.body.respuesta).not.toContain('09/05/2035');
  });

  it('filtra las mesas por el mes nombrado en la consulta', async () => {
    const res = await preguntar('mesas de diciembre');
    expect(res.body.respuesta).toContain('14/12/2035');
    expect(res.body.respuesta).not.toContain('14/05/2035');
  });

  it('entiende plurales y sinónimos: "me quiero inscribir"', async () => {
    const res = await preguntar('¿Cuándo me puedo inscribir?');
    expect(res.body.estrategia).toBe('DATOS_EXACTOS');
    expect(res.body.respuesta).toContain(
      'no hay una inscripción al cursado abierta',
    );
  });

  it('informa los trámites y avisa si el plazo ya cerró', async () => {
    const res = await preguntar('Trámites');
    expect(res.body.estrategia).toBe('DATOS_EXACTOS');
    expect(res.body.respuesta).toContain('Cambio de plan');
    expect(res.body.respuesta).toContain('ya cerró');
  });

  it('encuentra un evento del calendario por un sinónimo (vacaciones → receso)', async () => {
    const res = await preguntar('¿Cuándo son las vacaciones de verano?');
    expect(res.body.estrategia).toBe('DATOS_EXACTOS');
    expect(res.body.respuesta).toContain('Receso académico de verano');
  });

  it('entiende "llamado" como mesa y marca las inscripciones ya cerradas', async () => {
    const res = await preguntar('¿Cuál es el siguiente llamado?');
    expect(res.body.estrategia).toBe('DATOS_EXACTOS');
    expect(res.body.respuesta).toContain(
      '20/05/2035: 1° turno · Mesa II (cierre de inscripción: 01/01/2020). Inscripción cerrada.',
    );
    expect(res.body.respuesta).not.toContain(
      '10/05/2035). Inscripción cerrada.',
    );
  });

  it('deriva las correlativas de una materia que no está cargada', async () => {
    const res = await preguntar('Correlativas de Matemática en Programación');
    expect(res.body.estrategia).toBe('ABSTENCION');
    expect(res.body.derivada).toBe(true);
  });

  it('se abstiene y deriva lo que no tiene evidencia', async () => {
    const res = await preguntar('¿Cuál es el horario del comedor?');
    expect(res.body.estrategia).toBe('ABSTENCION');
    expect(res.body.derivada).toBe(true);
  });
});
