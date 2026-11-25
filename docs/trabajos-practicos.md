> Historial de TP9 a TP12, conservado antes de completar los servicios. El estado actual se documenta en [README](../README.md).

# AIda – Backend

**Trabajo Final – Tecnicatura Universitaria en Programación – UTN FRT**

API de AIda, el Asistente Institucional De Alumnos de la UTN Facultad Regional Tucumán, desarrollada con **Nest.js**.

El TP9 incorporó la estructura modular y doce recursos REST con operaciones CRUD de ejemplo. Desde el TP12, el registro y el login guardan y consultan usuarios reales mediante Prisma y Supabase. Los otros recursos conservan los mensajes del generador de NestJS.

📁 **Repositorio N.º 1** (HTML, CSS y JavaScript): [lazartej71/AIda](https://github.com/lazartej71/AIda)
📁 **Repositorio N.º 2** (frontend en React): [JuanDiaz26/aida-frontend](https://github.com/JuanDiaz26/aida-frontend)

## Integrantes

- Lazarte, Jorge Exequiel
- Díaz, Juan Gabriel

## Tecnologías

- **Nest.js** con **TypeScript**
- **class-validator** y **class-transformer** para validar los datos que llegan a la API
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

| Script               | Qué hace                                             |
| -------------------- | ---------------------------------------------------- |
| `npm run start:dev`  | Levanta el servidor y lo reinicia al guardar cambios |
| `npm run build`      | Compila el proyecto en `dist/`                       |
| `npm run start:prod` | Levanta la versión compilada                         |
| `npm run lint`       | Revisa el código con ESLint                          |
| `npm run format`     | Formatea el código con Prettier                      |

Las reglas de ESLint se configuran en `eslint.config.js`, usando el formato actual de ESLint y soporte para TypeScript. El formato del código se aplica por separado con `npm run format`, según `.prettierrc`.

## Pruebas con Postman

La carpeta `postman/` tiene la colección `AIda-backend.postman_collection.json`, con los pedidos de todas las rutas: una carpeta por recurso con `GET` para listar, `GET /:id`, `POST`, `PATCH` y `DELETE`, y cuerpos JSON de ejemplo. La carpeta **Validaciones (errores esperados)** tiene pedidos con datos incorrectos, cada uno con el error 400 que tiene que devolver.

Para usarla:

1. En Postman, **Import** y elegir el archivo de la colección.
2. Levantar el servidor con `npm run start:dev`.
3. Enviar los pedidos. La variable `baseUrl` (por defecto `http://localhost:3000`) se cambia en la pestaña **Variables** de la colección si el servidor usa otro puerto.

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
│   ├── pipes/                   validación de datos (crearValidacion)
│   ├── interceptors/
│   ├── enums/                   valores permitidos de los campos (tipo, llamado, estado…)
│   └── interfaces/
├── config/                      configuración y variables de entorno
└── database/
    ├── migrations/              creación de las tablas (001_crear_tablas.sql)
    ├── seeds/                   datos iniciales (001_datos_iniciales.sql)
    └── verificacion.sql         consultas para comprobar los datos y las restricciones
```

Dentro de cada recurso, el controlador recibe las peticiones HTTP y llama al servicio, que contiene las respuestas de ejemplo. El módulo reúne su controlador y servicio. `dto/` contiene las clases para los datos de creación y actualización; `UpdateDto` usa `PartialType` de `@nestjs/mapped-types`, dependencia agregada por el generador de Usuarios. Desde el TP10 los DTO definen y validan los datos de cada recurso (ver más abajo). Las entidades que crea el generador (`entities/`) se eliminaron al conectar Prisma: los modelos de cada tabla están en `prisma/schema.prisma`. También se eliminaron los archivos de prueba generados (`*.spec.ts`) y las carpetas vacías.

## Alcance del TP9

`src/main.ts` arranca la aplicación y `src/modules/app/` conserva el módulo, controlador y servicio principales. `AppModule` importa explícitamente los doce módulos REST. El controlador principal mantiene `GET /` con la respuesta `Hello World!`.

| Ruta base               | Responsabilidad prevista                                   |
| ----------------------- | ---------------------------------------------------------- |
| `/usuarios`             | Usuarios del sistema, sin credenciales ni roles en este TP |
| `/carreras`             | Carreras y planes de estudio                               |
| `/materias`             | Materias y correlatividades                                |
| `/mesas-examen`         | Mesas de examen                                            |
| `/inscripciones`        | Períodos de inscripción                                    |
| `/calendario-academico` | Fechas y eventos académicos                                |
| `/ingreso`              | Información para ingresantes                               |
| `/tramites`             | Trámites administrativos                                   |
| `/documentos`           | Documentos institucionales                                 |
| `/preguntas-frecuentes` | Preguntas y respuestas oficiales                           |
| `/chat`                 | Conversaciones, únicamente como recurso CRUD de ejemplo    |
| `/derivaciones`         | Consultas derivadas al personal                            |

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
npm run start:dev
```

Si el puerto 3000 está ocupado, se puede probar otro puerto en PowerShell con `$env:PORT = '3001'` antes de iniciar. La integración Observe ya venía en el proyecto; sin sus credenciales muestra una advertencia y no envía telemetría.

En el TP9 se dejaron para trabajos posteriores la persistencia, la autenticación, los permisos, la conexión con el frontend y la integración de IA. Desde el TP12, `auth` implementa el registro y login descritos más abajo. Las carpetas `ia` (proveedores de IA), `asistente` (coordinación de respuestas), `canales` (adaptadores de comunicación) y `metricas` (estadísticas) siguen reservadas. Chat todavía no responde consultas ni se conecta a un modelo de lenguaje.

## DTO y validación (TP10)

Un **DTO** (_Data Transfer Object_) es una clase que describe qué datos espera recibir cada operación. Con los decoradores de **class-validator** (`@IsString`, `@IsInt`, `@IsEnum`, `@IsDateString`, `@MaxLength`, etc.) indica qué condiciones tiene que cumplir cada campo. El DTO no guarda datos: solo describe y valida lo que entra.

`main.ts` activa la validación para toda la API con `app.useGlobalPipes(crearValidacion())`. La función está en `src/common/pipes/validacion.pipe.ts` y crea un `ValidationPipe` con dos opciones:

- `whitelist`: descarta los campos que el DTO no declara.
- `forbidNonWhitelisted`: responde con un error si llega un campo que el DTO no declara.

El controlador recibe el cuerpo con `@Body()` y su tipo es el DTO, así Nest valida los datos **antes** de ejecutar el método. Si algo no cumple, responde `400 Bad Request` con los mensajes de error:

```json
{
  "message": ["El nombre es obligatorio."],
  "error": "Bad Request",
  "statusCode": 400
}
```

Cada módulo tiene su `Create...Dto`, con los mismos campos que su tabla en la base de datos. El `Update...Dto` usa `PartialType`, así todos los campos pasan a ser opcionales para las actualizaciones parciales:

| Recurso                | Campos obligatorios                                           | Campos opcionales                                    |
| ---------------------- | ------------------------------------------------------------- | ---------------------------------------------------- |
| `carreras`             | `nombre`, `tipo`                                              | `duracionAnios`, `plan`, `activa`                    |
| `materias`             | `carreraId`, `codigo`, `nombre`, `nivel`                      | `esElectiva`                                         |
| `mesas-examen`         | `materiaId`, `turno`, `llamado`, `fecha`, `cierreInscripcion` | `documentoId`                                        |
| `inscripciones`        | `descripcion`, `tipo`, `fechaDesde`, `fechaHasta`             | `nivel`, `documentoId`                               |
| `calendario-academico` | `titulo`, `tipo`, `fechaDesde`                                | `fechaHasta`, `documentoId`                          |
| `ingreso`              | `titulo`, `descripcion`                                       | `modalidad`, `inscripcionDesde`, `inscripcionHasta`  |
| `tramites`             | `nombre`, `descripcion`                                       | `oficina`, `plazoDesde`, `plazoHasta`, `documentoId` |
| `documentos`           | `titulo`, `tipo`                                              | `numero`, `url`, `vigenteDesde`, `vigenteHasta`      |
| `preguntas-frecuentes` | `pregunta`, `respuesta`, `categoria`                          | `documentoId`                                        |
| `chat`                 | `canal`, `mensaje`                                            | `estado` (solo al actualizar)                        |
| `derivaciones`         | `conversacionId`, `motivo`                                    | `prioridad`; al actualizar, `estado` y `respuesta`   |

- Las fechas se envían como texto con formato `AAAA-MM-DD`.
- Los campos con valores fijos (`tipo`, `llamado`, `canal`, `estado`, `prioridad`, `modalidad`) usan los _enums_ de `src/common/enums/`, con los mismos valores que las restricciones de la base de datos.
- Para marcar una derivación como `RESUELTA` hay que enviar la `respuesta`.
- Desde el TP12, `CreateUsuarioDto` valida `nombre`, `email` y `password` y se reutiliza en el registro de `auth`. No existe un segundo registro en `POST /usuarios`.

**Cómo probarlo:** en Postman, la carpeta **Validaciones (errores esperados)** manda datos incorrectos: un campo obligatorio que falta, texto donde va un número, un valor distinto de `true` o `false`, una fecha con otro formato y un campo que el DTO no declara.

## Base de datos

Se usa **PostgreSQL**, alojado en **Supabase**. La conexión se configura en el `.env` con `DATABASE_URL`.

### Tablas y relaciones

```
carreras ──< materias >──< correlatividades     (una materia requiere otras para cursar o rendir)
materias ──< mesas_examen                       (turno, llamado I/II/III, fecha y cierre de inscripción)
conversaciones ──< mensajes
conversaciones ──< derivaciones
documentos ──< mesas_examen, periodos_inscripcion, eventos_academicos,
               tramites, preguntas_frecuentes, mensajes   (el documento oficial que respalda cada dato)
```

`──<` indica una relación de uno a muchos.

| Tabla                         | Qué guarda                                                               | Módulo                 |
| ----------------------------- | ------------------------------------------------------------------------ | ---------------------- |
| `documentos`                  | Resoluciones, ordenanzas y planes de estudio, con su vigencia            | `documentos`           |
| `carreras`                    | Carreras de grado y de pregrado                                          | `carreras`             |
| `materias`                    | Materias de cada carrera, con código y nivel                             | `materias`             |
| `correlatividades`            | Qué materias requiere cada una, para cursar o rendir, y en qué condición | `materias`             |
| `mesas_examen`                | Turnos y llamados de examen con su cierre de inscripción                 | `mesas-examen`         |
| `periodos_inscripcion`        | Períodos de inscripción al cursado                                       | `inscripciones`        |
| `eventos_academicos`          | Clases, recesos y pruebas de suficiencia del calendario                  | `calendario-academico` |
| `info_ingreso`                | Seminario de ingreso y pruebas de suficiencia                            | `ingreso`              |
| `tramites`                    | Trámites de los estudiantes y su plazo                                   | `tramites`             |
| `preguntas_frecuentes`        | Preguntas con su respuesta oficial y su fuente                           | `preguntas-frecuentes` |
| `conversaciones` y `mensajes` | Consultas de los estudiantes al asistente                                | `chat`                 |
| `derivaciones`                | Consultas que el asistente pasa al personal, con prioridad y estado      | `derivaciones`         |

Cada tabla tiene clave primaria `id` (salvo `correlatividades`, que usa una clave compuesta). Las restricciones cuidan la coherencia de los datos: claves foráneas entre tablas, valores permitidos con `CHECK` (por ejemplo, el llamado solo puede ser I, II o III), fechas de fin posteriores a las de inicio, nombres únicos y una derivación resuelta que obligatoriamente tiene respuesta.

### Datos iniciales

Cada tabla tiene al menos 5 registros. Los datos institucionales salen del sitio oficial de la UTN FRT: el Calendario Académico 2026 (Resolución 2394/2025), el plan de estudio de Ingeniería en Sistemas de Información 2023 y el Seminario de Ingreso 2027. Las conversaciones, mensajes y derivaciones son de ejemplo.

### SQL original (antes del TP11)

En Supabase, desde el **SQL Editor**, ejecutar en este orden:

1. `src/database/migrations/001_crear_tablas.sql`
2. `src/database/seeds/001_datos_iniciales.sql`
3. `src/database/verificacion.sql`, para comprobar que cada tabla tenga sus registros, que las relaciones sean correctas y que no haya datos huérfanos. Al final del archivo hay pruebas de restricciones que tienen que fallar.

Estos archivos se conservan como evidencia de la etapa anterior. **No volver a ejecutar `001_crear_tablas.sql` sobre la base actual: contiene `DROP TABLE`.** Desde el TP11, los cambios se administran con Prisma Migrate.

### TP11: NestJS, Prisma 7 y PostgreSQL

Se sigue la configuración del [repositorio de la profesora](https://github.com/georginacostilla/Back-repoPrueba-AlumnosProgramacionIV-/tree/e9033c1d6970432cc48e75230e8c9b8ab20f150f): `prisma7.config.ts`, generador `prisma-client` con salida en `src/generated/prisma`, `PrismaService` y `PrismaModule`. Se agregó cierre de conexiones y configuración TLS compartida para Supabase.

- `prisma` es la herramienta de terminal para validar, generar el cliente y administrar migraciones.
- `@prisma/client` es la biblioteca utilizada por el cliente generado para consultar y modificar registros desde TypeScript.
- `@prisma/adapter-pg` conecta Prisma 7 con PostgreSQL mediante el controlador `pg`.

La inicialización se realizó con `npx prisma init --datasource-provider postgresql --output ../src/generated/prisma`. El esquema contiene los 13 modelos de AIda con campos en camelCase y `@map`/`@@map` para respetar los nombres SQL existentes. Los valores permitidos siguen siendo `VARCHAR` con `CHECK`, como en la base original; no se convierten en enums nativos de PostgreSQL.

```bash
npm install
npm run prisma:validate
npm run prisma:generate
npm run db:check
```

`npm install` y `npm run build` generan automáticamente Prisma Client. El código generado no se versiona. `PrismaModule` es global y exporta `PrismaService`: se conecta al iniciar NestJS y se desconecta al cerrar la aplicación. Los tests de rutas sustituyen ese proveedor para ejecutarse sin acceder a Supabase; `db:check` verifica la conexión real.

### Migración inicial con las tablas que ya existen

La base de Supabase se creó y cargó mediante SQL antes de incorporar Prisma. Por eso se preparó `prisma/migrations/0_init/migration.sql` como **baseline**: representa el estado inicial, conserva claves, índices y restricciones `CHECK`, y activa RLS en las 13 tablas. No incluye borrados ni los datos de ejemplo.

Una vez comprobados el certificado SSL y la conexión:

```bash
npm run db:check
npm run prisma:baseline
npm run prisma:status
```

`prisma:baseline` primero compara la estructura de la base con `schema.prisma` usando `prisma migrate diff`. Solo si coincide registra `0_init` con `prisma migrate resolve --applied 0_init`. Esto escribe el historial de Prisma sin volver a crear las tablas. La comparación no cubre funciones como `CHECK` y RLS: se conservan explícitamente en el SQL inicial y deben revisarse con la verificación SQL y la salida RLS de `db:check`. Referencia: [baselining de Prisma](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/baselining).

Para crear una base nueva y vacía usando la migración preparada, usar `npm run prisma:deploy` y después cargar el seed SQL si se necesitan los ejemplos. No usar `prisma:baseline` en una base vacía.

El comando del enunciado, `npx prisma migrate dev --name init`, corresponde a generar la migración en una **base de desarrollo vacía**. En la base actual se reemplaza por el baseline para conservar los datos. Los cambios posteriores se generan en una base de desarrollo con `npm run prisma:migrate -- --name nombre_del_cambio`. `migrate dev` necesita una base auxiliar (_shadow database_); configurar `SHADOW_DATABASE_URL` si el usuario no tiene permiso para crearla, usando una base distinta y descartable. No apuntarla al proyecto actual ni aceptar un reset de los datos cargados.

### Comprobar la conexión desde el backend

En el panel **Conectar** de Supabase, copiar la cadena PostgreSQL de **Session pooler** al valor de `DATABASE_URL` en `.env`. Reemplazar el marcador de contraseña por la contraseña de la base; si tiene caracteres especiales, codificarlos para una URL. No usar la URL HTTPS de la API ni una clave de Supabase como contraseña.

```bash
npm run db:check
```

Este comando compila y realiza consultas de lectura: comprueba la conexión, cuenta los registros de las 14 tablas (las 13 originales más `usuarios`, agregada en el TP12) y muestra si RLS está activado. No crea ni borra datos y no imprime credenciales. En Supabase se usa TLS con verificación de certificado. La tabla `usuarios` puede estar vacía hasta el primer registro; no lleva usuarios ni contraseñas de ejemplo en el seed.

Si aparece `SELF_SIGNED_CERT_IN_CHAIN`, descargar el certificado raíz desde **Database Settings → SSL Configuration → Download Certificate** de Supabase y guardarlo como `prod-supabase.cer` en la raíz del backend. Se detecta automáticamente. También se puede indicar otra ubicación con `DATABASE_SSL_CA` en `.env`. Volver a ejecutar `npm run db:check` después de descargarlo.

`db:check` usa Prisma Client para contar los registros y consultar el estado de RLS. Los CRUD generales todavía devuelven respuestas de ejemplo; el TP12 incorpora persistencia para el registro y login. Por ejemplo, otros servicios podrán inyectar `PrismaService` y consultar `this.prisma.carrera.findMany()`. Postman sigue siendo la herramienta para probar las rutas HTTP de NestJS. RLS protege el acceso mediante la API de Supabase, pero una conexión con el usuario `postgres` puede omitirlo: la autorización de las rutas debe implementarse en NestJS antes de exponer datos.

## TP12: autenticación con NestJS

Se implementaron registro e inicio de sesión siguiendo el módulo `auth` del repositorio actualizado de la profesora. Se reutiliza el recurso `usuarios` del proyecto: su entidad y DTO estaban vacíos y no existía una tabla para este recurso. Se incorporó el modelo `Usuario`, mapeado a `usuarios`, en la misma base de Supabase mediante la migración `20261124000000_agregar_usuarios`. Esta migración solo agrega la tabla, su índice único de correo y RLS; conserva las 13 tablas y todos los datos del TP11.

### Configuración

Las dependencias son `@nestjs/jwt`, `bcrypt` y `@types/bcrypt`. En una copia nueva del proyecto:

```bash
npm install
# Crear .env a partir de .env.example y completar DATABASE_URL y JWT_SECRET.
npm run prisma:deploy
npm run start:dev
```

`JWT_SECRET` es un secreto privado de al menos 32 bytes aleatorios. No tiene un valor por defecto y no se sube al repositorio. La aplicación rechaza una configuración ausente o demasiado corta. En el entorno local de desarrollo ya se generó un secreto en `.env`. Cada integrante debe configurar el suyo; cambiarlo invalida los JWT firmados con el secreto anterior.

### Registro y login

| Pedido                | Cuerpo JSON                   | Respuesta correcta             |
| --------------------- | ----------------------------- | ------------------------------ |
| `POST /auth/register` | `nombre`, `email`, `password` | `201`, usuario público         |
| `POST /auth/login`    | `email`, `password`           | `200`, `access_token` y `user` |

`POST /auth/register` es la **única ruta de registro**. Se eliminó `POST /usuarios` para evitar duplicar la operación. Las demás rutas de usuarios conservan sus respuestas de ejemplo y no exponen registros reales.

El nombre se recorta y debe tener entre 2 y 80 caracteres. El correo se recorta, se convierte a minúsculas y se valida antes de consultar o guardar; el índice único evita duplicados incluso ante registros concurrentes. La contraseña debe tener al menos 8 caracteres y no superar los 72 bytes UTF-8 que admite bcrypt. No se recorta ni transforma la contraseña.

El registro guarda únicamente `password_hash`, generado con bcrypt y costo 12. Un correo duplicado devuelve `409 Conflict`. El login verifica el hash y responde `401 Unauthorized` con el mismo mensaje tanto para un correo inexistente como para una contraseña incorrecta. Los datos inválidos o campos adicionales devuelven `400 Bad Request`.

El JWT se firma con HS256 y vence en una hora. Su contenido incluye `sub` (id del usuario), `email`, `iat` y `exp`. Ni las respuestas ni el token contienen contraseñas o hashes. La respuesta de login permite guardar el token para futuras rutas protegidas; este TP todavía no agrega guards ni autorización a los CRUD.

### Pruebas en Postman

Importar `postman/AIda-backend.postman_collection.json` y ejecutar la carpeta **Autenticación (TP12)** en orden con **Collection Runner**. Tiene 11 pedidos con pruebas de respuestas correctas, JWT, duplicados, credenciales incorrectas, validaciones y ausencia de la ruta duplicada. El registro genera un correo nuevo y el login guarda el token en `accessToken`. Ver [guía de Postman del TP12](../postman/TP12-autenticacion.md).

También se puede ejecutar esa carpeta desde una terminal con Newman mientras el servidor está levantado:

```bash
npx --yes newman run postman/AIda-backend.postman_collection.json --folder "Autenticación (TP12)"
```

No compartir exportaciones de Postman que incluyan tokens o credenciales reales.

Validación realizada para el TP12: compilación y lint correctos. La colección Postman se ejecutó mediante Newman contra NestJS y Supabase: 11 pedidos y 26 assertions aprobadas. Además se verificaron el hash persistido, la firma del JWT y sus 3600 segundos de vigencia. Se eliminó la cuenta temporal usada en esa ejecución. La base conserva los conteos originales del TP11 y tiene RLS activo en sus 14 tablas.

## Flujo de trabajo

Cada tarea se hace en su propia rama, se abre un PR a `dev` y, una vez revisado, un PR de `dev` a `main`, la rama estable.

| Rama              | Para qué                           |
| ----------------- | ---------------------------------- |
| `feature/nombre`  | Nuevas funcionalidades             |
| `fix/nombre`      | Correcciones                       |
| `refactor/nombre` | Reorganización o mejora del código |
| `docs/nombre`     | Cambios en la documentación        |
