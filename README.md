# AIda – Backend

**Trabajo Final – Tecnicatura Universitaria en Programación – UTN FRT**

API de AIda, el Asistente Institucional De Alumnos de la UTN Facultad Regional Tucumán, desarrollada con **Nest.js**.

El TP9 incluye la estructura modular y doce recursos REST con operaciones CRUD de ejemplo. Los servicios devuelven los mensajes del generador de NestJS: todavía no guardan ni consultan datos reales.

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

Dentro de cada recurso, el controlador recibe las peticiones HTTP y llama al servicio, que contiene las respuestas de ejemplo. El módulo reúne su controlador y servicio. `dto/` contiene las clases para los datos de creación y actualización; `UpdateDto` usa `PartialType` de `@nestjs/mapped-types`, dependencia agregada por el generador de Usuarios. `entities/` contiene la clase que representará al recurso. Por ahora los DTO y las entidades están vacíos, sin conexión a una base de datos. Las carpetas reservadas para futuras etapas conservan sus archivos `.gitkeep`.

## Alcance del TP9

`src/main.ts` arranca la aplicación y `src/modules/app/` conserva el módulo, controlador y servicio principales. `AppModule` importa explícitamente los doce módulos REST. El controlador principal mantiene `GET /` con la respuesta `Hello World!`.

| Ruta base | Responsabilidad prevista |
|---|---|
| `/usuarios` | Usuarios del sistema, sin credenciales ni roles en este TP |
| `/carreras` | Carreras y planes de estudio |
| `/materias` | Materias y correlatividades |
| `/mesas-examen` | Mesas de examen |
| `/inscripciones` | Períodos de inscripción |
| `/calendario-academico` | Fechas y eventos académicos |
| `/ingreso` | Información para ingresantes |
| `/tramites` | Trámites administrativos |
| `/documentos` | Documentos institucionales |
| `/preguntas-frecuentes` | Preguntas y respuestas oficiales |
| `/chat` | Conversaciones, únicamente como recurso CRUD de ejemplo |
| `/derivaciones` | Consultas derivadas al personal |

Cada ruta base tiene `GET` para listar y `POST` para crear; con `/:id`, tiene `GET` para consultar, `PATCH` para actualizar y `DELETE` para eliminar. POST responde con estado 201 y las otras operaciones con 200. Todas devuelven texto de ejemplo, sin persistencia. Por ejemplo, `GET /usuarios/1` devuelve `This action returns a #1 usuario`.

Los once recursos nuevos se generaron con Nest CLI mediante este comando, reemplazando `nombre-modulo` por cada recurso de la tabla excepto Usuarios, que ya estaba generado:

```bash
npx nest g resource modules/nombre-modulo --type rest --crud --skip-import
```

`--type rest --crud` selecciona REST API y las operaciones CRUD sin preguntas interactivas. Se usó `--skip-import` y se registraron los módulos manualmente porque el generador busca un módulo en las carpetas superiores del recurso y `modules/app/app.module.ts` está en una carpeta hermana. Se conservaron los imports `.js` requeridos por la configuración ESM del proyecto. Los parámetros DTO que aún no se usan en los servicios llevan el prefijo `_`, admitido explícitamente por ESLint.

En PowerShell, si la política de ejecución bloquea `npm.ps1` o `npx.ps1`, se pueden usar `npm.cmd` y `npx.cmd` sin cambiar esa política.

Para verificar el trabajo:

```bash
npm run build
npm run lint
npm test
npm run test:e2e
npm run start:dev
```

Si el puerto 3000 está ocupado, se puede probar otro puerto en PowerShell con `$env:PORT = '3001'` antes de iniciar. La integración Observe ya venía en el proyecto; sin sus credenciales muestra una advertencia y no envía telemetría.

Se dejan para próximos trabajos la definición de campos y validaciones, la persistencia, la autenticación, los permisos, la conexión con el frontend y la integración de IA. Las carpetas `auth` (autenticación), `ia` (proveedores de IA), `asistente` (coordinación de respuestas), `canales` (adaptadores de comunicación) y `metricas` (estadísticas) quedan reservadas: sus responsabilidades no requieren un CRUD genérico en este TP. Chat todavía no responde consultas ni se conecta a un modelo de lenguaje.

## Flujo de trabajo
Cada tarea se hace en una rama `feature/...`, se abre un PR a `dev` y, una vez revisado, un PR de `dev` a `main`.
