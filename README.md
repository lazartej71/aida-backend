# AIda – Backend

**Trabajo Final – Tecnicatura Universitaria en Programación – UTN FRT**

API de AIda, el Asistente Institucional De Alumnos de la UTN Facultad Regional Tucumán, desarrollada con **Nest.js**.

Por ahora el repositorio tiene la estructura de carpetas y módulos; el código de cada módulo se desarrolla en las próximas etapas.

📁 **Repositorio N.º 1** (HTML, CSS y JavaScript): [lazartej71/AIda](https://github.com/lazartej71/AIda)
📁 **Repositorio N.º 2** (frontend en React): [JuanDiaz26/aida-frontend](https://github.com/JuanDiaz26/aida-frontend)

## Integrantes
- Lazarte, Jorge Exequiel
- Díaz, Juan Gabriel

## Tecnologías
- **Nest.js** con **TypeScript**
- **Vitest** para los tests
- **ESLint** y **Prettier** para revisar y formatear el código

## Cómo correrlo
```bash
npm install
cp .env.example .env
npm run start:dev
```
El servidor queda en `http://localhost:3000`.

El archivo `.env` **no se sube a GitHub** (figura en `.gitignore`). Cada integrante lo crea a partir de `.env.example`, que tiene los nombres de las variables sin valores secretos.

## Scripts
| Script | Qué hace |
|---|---|
| `npm run start:dev` | Levanta el servidor y lo reinicia al guardar cambios |
| `npm run build` | Compila el proyecto en `dist/` |
| `npm run start:prod` | Levanta la versión compilada |
| `npm test` | Corre los tests |
| `npm run test:e2e` | Corre los tests de punta a punta |
| `npm run lint` | Revisa el código con ESLint |
| `npm run format` | Formatea el código con Prettier |

Las reglas de ESLint se configuran en `eslint.config.js`, usando el formato actual de ESLint y soporte para TypeScript y Vitest. El formato del código se aplica por separado con `npm run format`, según `.prettierrc`.

## Estructura
```
src/
├── main.ts                      arranca el servidor
├── modules/
│   ├── app/                     módulo principal, que reúne a los demás
│   ├── auth/                    inicio de sesión del personal
│   ├── usuarios/                personal de Bedelía, Alumnado y Secretaría, y sus roles
│   ├── carreras/                carreras y planes de estudio
│   ├── materias/                materias y correlativas
│   ├── mesas-examen/            mesas de examen y sus fechas
│   ├── inscripciones/           períodos de inscripción
│   ├── calendario-academico/    fechas del ciclo lectivo
│   ├── ingreso/                 información para ingresantes
│   ├── tramites/                trámites administrativos
│   ├── documentos/              reglamentos y documentos oficiales, con versión y vigencia
│   ├── preguntas-frecuentes/    preguntas y respuestas oficiales
│   ├── chat/                    conversaciones de los estudiantes con el asistente
│   ├── canales/                 un adaptador por canal: widget web y WhatsApp
│   ├── asistente/               decide cómo responder cada consulta
│   │   └── estrategias/
│   │       ├── datos-exactos/            consulta directa a la base de datos (fechas, correlativas)
│   │       ├── recuperacion-documental/  busca el documento oficial que responde la consulta
│   │       └── abstencion/               si no hay evidencia suficiente, no responde y deriva
│   ├── ia/                      integración con el modelo de lenguaje
│   │   ├── proveedores/         el modelo puede cambiarse sin tocar el resto
│   │   ├── prompts/
│   │   └── embeddings/          búsqueda por significado
│   ├── derivaciones/            bandeja de consultas derivadas al personal
│   └── metricas/                preguntas más frecuentes, temas sin respuesta, tiempos y costos
├── common/                      lo que comparten todos los módulos
│   ├── guards/                  protección de rutas
│   ├── decorators/
│   ├── filters/                 manejo de errores
│   ├── pipes/                   validación de datos
│   ├── interceptors/
│   ├── enums/
│   └── interfaces/
├── config/                      configuración y variables de entorno
└── database/
    ├── migrations/              cambios en la estructura de la base de datos
    └── seeds/                   datos iniciales
test/                            tests de punta a punta
```

Dentro de cada módulo, `dto/` define los datos que recibe cada pedido y `entities/` cómo se guardan en la base de datos. Las carpetas vacías tienen un archivo `.gitkeep` para que Git las suba.

## Flujo de trabajo
Cada tarea se hace en una rama `feature/...`, se abre un PR a `dev` y, una vez revisado, un PR de `dev` a `main`.
