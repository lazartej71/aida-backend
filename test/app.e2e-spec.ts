import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/modules/app/app.module.js';

describe('API REST TP9 (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

    it('POST recibe el cuerpo de creación', async () => {
      await request(app.getHttpServer())
        .post(`/${route}`)
        .send({})
        .expect(201)
        .expect(`This action adds a new ${singular}`);
    });

    it('PATCH /:id recibe el cuerpo de actualización', async () => {
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

  afterAll(async () => {
    await app.close();
  });
});
