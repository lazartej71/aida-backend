import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { crearValidacion } from './../src/common/pipes/validacion.pipe.js';
import { AppModule } from './../src/modules/app/app.module.js';

// Cuerpos válidos para crear un registro de cada recurso
const cuerposValidos: Record<string, object> = {
  usuarios: {},
  carreras: {
    nombre: 'Tecnicatura Universitaria en Programación',
    tipo: 'PREGRADO',
  },
  materias: {
    carreraId: 1,
    codigo: 24,
    nombre: 'Inteligencia Artificial',
    nivel: 5,
  },
  'mesas-examen': {
    materiaId: 6,
    turno: 7,
    llamado: 'I',
    fecha: '2026-12-14',
    cierreInscripcion: '2026-12-10',
  },
  inscripciones: {
    descripcion: 'Inscripción a las asignaturas del 2° cuatrimestre',
    tipo: 'CURSADO',
    fechaDesde: '2026-08-10',
    fechaHasta: '2026-08-14',
  },
  'calendario-academico': {
    titulo: 'Receso académico de invierno',
    tipo: 'RECESO',
    fechaDesde: '2026-07-13',
    fechaHasta: '2026-07-24',
  },
  ingreso: {
    titulo: 'Prueba de Suficiencia Diciembre 2026',
    descripcion: 'Matemática y Física.',
    modalidad: 'LIBRE',
  },
  tramites: {
    nombre: 'Cambio de plan',
    descripcion: 'Presentación de notas para pasar a otro plan de estudios.',
  },
  documentos: {
    titulo: 'Calendario Académico 2026 - Carreras de grado',
    tipo: 'RESOLUCION',
    numero: '2394/2025',
  },
  'preguntas-frecuentes': {
    pregunta: '¿Dónde queda la facultad?',
    respuesta: 'En Rivadavia 1050, San Miguel de Tucumán.',
    categoria: 'Institucional',
  },
  chat: { canal: 'WEB', mensaje: '¿Cuándo empiezan las clases?' },
  derivaciones: {
    conversacionId: 1,
    motivo: 'Sin información oficial sobre el costo del seminario',
  },
};

describe('API REST (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // La misma validación que usa main.ts
    app.useGlobalPipes(crearValidacion());
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe.each([
    ['usuarios', 'usuario', 'usuarios'],
    ['carreras', 'carrera', 'carreras'],
    ['materias', 'materia', 'materias'],
    ['mesas-examen', 'mesasExaman', 'mesasExamen'],
    ['inscripciones', 'inscripcione', 'inscripciones'],
    ['calendario-academico', 'calendarioAcademico', 'calendarioAcademico'],
    ['ingreso', 'ingreso', 'ingreso'],
    ['tramites', 'tramite', 'tramites'],
    ['documentos', 'documento', 'documentos'],
    ['preguntas-frecuentes', 'preguntasFrecuente', 'preguntasFrecuentes'],
    ['chat', 'chat', 'chat'],
    ['derivaciones', 'derivacione', 'derivaciones'],
  ])('/%s', (route, singular, plural) => {
    it('GET lista los recursos', async () => {
      await request(app.getHttpServer())
        .get(`/${route}`)
        .expect(200)
        .expect(`This action returns all ${plural}`);
    });

    it('GET /:id consulta un recurso', async () => {
      await request(app.getHttpServer())
        .get(`/${route}/1`)
        .expect(200)
        .expect(`This action returns a #1 ${singular}`);
    });

    it('POST acepta un cuerpo válido', async () => {
      await request(app.getHttpServer())
        .post(`/${route}`)
        .send(cuerposValidos[route])
        .expect(201)
        .expect(`This action adds a new ${singular}`);
    });

    it('PATCH /:id acepta una actualización parcial', async () => {
      await request(app.getHttpServer())
        .patch(`/${route}/1`)
        .send({})
        .expect(200)
        .expect(`This action updates a #1 ${singular}`);
    });

    it('DELETE /:id elimina un recurso de ejemplo', async () => {
      await request(app.getHttpServer())
        .delete(`/${route}/1`)
        .expect(200)
        .expect(`This action removes a #1 ${singular}`);
    });
  });

  // Cada caso manda un dato incorrecto y espera el error 400 con el mensaje del DTO
  describe('validación de los datos', () => {
    it.each([
      [
        'falta un campo obligatorio',
        'post',
        '/carreras',
        { tipo: 'GRADO' },
        'El nombre es obligatorio.',
      ],
      [
        'texto donde se espera un número',
        'post',
        '/materias',
        {
          carreraId: 1,
          codigo: 24,
          nombre: 'Inteligencia Artificial',
          nivel: 'cinco',
        },
        'El nivel debe ser un número entero.',
      ],
      [
        'un valor distinto de true o false',
        'post',
        '/carreras',
        { nombre: 'Ingeniería Química', tipo: 'GRADO', activa: 'si' },
        'El campo activa debe ser true o false.',
      ],
      [
        'un valor que no está en la lista permitida',
        'post',
        '/mesas-examen',
        { ...cuerposValidos['mesas-examen'], llamado: 'IV' },
        'El llamado debe ser I, II o III.',
      ],
      [
        'una fecha con formato incorrecto',
        'post',
        '/inscripciones',
        { ...cuerposValidos.inscripciones, fechaDesde: '10/08/2026' },
        'La fecha de inicio debe tener el formato AAAA-MM-DD.',
      ],
      [
        'una URL inválida',
        'post',
        '/documentos',
        { ...cuerposValidos.documentos, url: 'frt.utn' },
        'La URL debe ser una dirección web válida (http o https).',
      ],
      [
        'un campo que el DTO no declara',
        'post',
        '/tramites',
        { ...cuerposValidos.tramites, costo: 100 },
        'property costo should not exist',
      ],
      [
        'una actualización con un valor inválido',
        'patch',
        '/chat/1',
        { estado: 'PAUSADA' },
        'El estado debe ser ABIERTA o CERRADA.',
      ],
      [
        'resolver una derivación sin respuesta',
        'patch',
        '/derivaciones/1',
        { estado: 'RESUELTA' },
        'Para resolver la derivación hay que enviar la respuesta.',
      ],
    ])('rechaza %s', async (_caso, metodo, ruta, cuerpo, mensaje) => {
      const servidor = app.getHttpServer();
      const pedido =
        metodo === 'post'
          ? request(servidor).post(ruta)
          : request(servidor).patch(ruta);

      const respuesta = await pedido.send(cuerpo).expect(400);

      expect(respuesta.body.message).toContain(mensaje);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
