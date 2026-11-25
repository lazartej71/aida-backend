# AIda — Backend

API del Asistente Institucional De Alumnos de la UTN FRT. Desarrollada con NestJS, TypeScript, Prisma 7 y PostgreSQL en Supabase.

Los servicios persisten datos reales. El backend reúne información académica, registro y login, gestión del personal, conversaciones privadas, respuestas con fuentes, derivaciones y métricas. La integración con el frontend se mantiene en su repositorio separado.

## Funcionalidades

| Módulos                              | Funcionalidad                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| Carreras, materias y mesas de examen | CRUD, filtros, correlatividades y comprobación de ciclos                                   |
| Inscripciones, calendario e ingreso  | CRUD y validación de fechas, también en actualizaciones parciales                          |
| Trámites y preguntas frecuentes      | CRUD y recuperación de respuestas institucionales                                          |
| Documentos                           | Metadatos, vigencia, historial de versiones e indexación de texto para búsqueda            |
| Auth y usuarios                      | Registro único, bcrypt, JWT, perfil, contraseña, cierre de sesiones, roles y desactivación |
| Chat                                 | Conversaciones persistidas, token privado por conversación y mensajes con fuentes          |
| Asistente e IA                       | Consulta de datos exactos, recuperación documental y abstención con derivación             |
| Derivaciones                         | Bandeja del personal, prioridad, resolución con fecha y respuesta agregada al chat         |
| Métricas                             | Consultas, estrategias utilizadas, preguntas frecuentes y tiempos de respuesta             |
| Canales                              | Canal web y adaptador de WhatsApp Cloud API configurable                                   |
| App y Prisma                         | Estado, salud de la base, conexiones, errores HTTP y documentación OpenAPI                 |

## Ejecutar

Requiere Node.js 24, una base PostgreSQL y la configuración local:

```bash
npm ci
# Crear .env a partir de .env.example y completar los valores.
npm run prisma:deploy
npm run start:dev
```

- API: `http://localhost:3000`
- Documentación interactiva: `http://localhost:3000/docs`
- OpenAPI: `http://localhost:3000/docs-json`
- Salud de PostgreSQL: `GET /salud`

`DATABASE_URL` contiene la cadena PostgreSQL del Session pooler de Supabase. `JWT_SECRET` debe tener al menos 32 bytes y mantenerse privado. El certificado descargado de Supabase se coloca como `prod-supabase.cer` junto al `.env`, o se indica su ruta con `DATABASE_SSL_CA`. La conexión verifica TLS.

`CORS_ORIGINS` configura los orígenes permitidos, separados por comas. Por defecto permite el frontend local en el puerto 5173. `.env`, certificados y archivos generados están excluidos de Git.

## Primer administrador

1. Registrar la cuenta mediante `POST /auth/register`, enviando `nombre`, `email` y `password` desde Postman.
2. En la terminal del backend, promover esa cuenta:

```bash
npm run usuarios:admin -- correo-de-la-cuenta-registrada
```

3. Iniciar sesión nuevamente con `POST /auth/login` y guardar `access_token`.
4. En Swagger, usar **Authorize**; en Postman, **Authorization → Bearer Token**.

El registro público crea cuentas `ESTUDIANTE`. Un administrador puede asignar `PERSONAL` o `ADMIN` desde `PATCH /usuarios/:id`. El sistema conserva al menos un administrador activo.

## Acceso

- Las consultas académicas son públicas. Sus altas, cambios y bajas requieren `PERSONAL` o `ADMIN`.
- La administración de usuarios requiere `ADMIN` y devuelve únicamente datos públicos de cada cuenta.
- Derivaciones, métricas, eventos de canales y gestión interna de conversaciones requieren personal autorizado.
- El chat web admite consultas sin registro. Devuelve `tokenConversacion`, que se envía después en `x-conversacion-token` para leer, continuar o cerrar esa conversación.
- Los JWT vencen en una hora. El cierre de sesiones, el cambio de contraseña y los cambios administrativos de la cuenta revocan los tokens anteriores. Cada solicitud protegida comprueba el estado actual de la cuenta.

## Cómo responde el asistente

El asistente no tiene respuestas escritas en el código: todo lo que contesta sale de la base de datos y cita el documento oficial que lo respalda. `AsistenteService` prueba cuatro estrategias en orden y se queda con la primera que responde:

| Orden | Estrategia | Qué hace | Archivo |
|---|---|---|---|
| 1 | Conversación | Responde saludos, agradecimientos y pedidos de ayuda, y lista lo que sabe responder. No crea derivaciones. | `estrategias/conversacion` |
| 2 | Datos exactos | Reconoce el tema de la consulta y busca el dato en su tabla: mesas y turnos de examen, correlativas, inscripciones, trámites, suficiencias, calendario, ingreso y carreras. | `estrategias/datos-exactos` |
| 3 | Recuperación documental | Busca en las preguntas frecuentes y en el texto de los documentos oficiales. Si la consulta es de un tema conocido, solo acepta documentos de ese tema. | `estrategias/recuperacion-documental` |
| 4 | Abstención | Si no hay evidencia, no inventa: avisa y deriva la consulta al personal (RN09). | `estrategias/abstencion` |

Reglas que aplica la búsqueda (en `ia/embeddings/texto.ts`):

- **Plurales y sinónimos:** "inscripciones", "me inscribo" y "anotarme" se entienden igual; "rendir" y "final" equivalen a "examen".
- **Meses:** "mesas de diciembre" muestra solo las de ese mes.
- **Vigencia:** solo usa datos cuyo documento está vigente (RN07).
- **Nada próximo no es "no sé":** si no hay inscripción abierta, dice cuál fue la última; si un trámite ya cerró, lo informa con su plazo; si una materia no tiene mesa propia, informa los turnos generales, que valen para todas.
- **Dato faltante:** si piden correlativas sin nombrar la materia, pregunta cuál en lugar de derivar.
- **Datos que la base no tiene** (aulas, horarios, docentes, costos): no los responde con datos exactos; si tampoco hay un documento, deriva.

La "sabiduría" del asistente es la información oficial cargada: los turnos de examen, las inscripciones, los trámites, los eventos del calendario, las preguntas frecuentes y el texto de los documentos. Para que responda más, hay que cargar más información oficial, no escribir respuestas a mano.

Los documentos se indexan mediante `POST /documentos/:id/contenido`, enviando texto institucional. El texto se parte por párrafos (separados por una línea en blanco), así cada fragmento es una idea completa que el asistente puede citar. Cada carga crea una versión y mantiene el historial. La recuperación utiliza la última versión y respeta la vigencia del documento.

El adaptador HTTP opcional de IA selecciona evidencia existente según el contrato descrito en [docs/backend.md](docs/backend.md). WhatsApp necesita una cuenta y credenciales de Meta: mientras falten, informa que no está configurado. El canal web sigue disponible. Los envíos reales de WhatsApp y un proveedor comercial de IA requieren configuración y validación con esas cuentas.

## Base de datos

El esquema tiene 18 tablas. Las migraciones se encuentran en `prisma/migrations`:

1. `0_init`: las 13 tablas originales, restricciones y RLS.
2. `20261124000000_agregar_usuarios`: cuentas del TP12.
3. `20261124010000_completar_backend`: permisos, fuentes de mensajes, versiones documentales, consultas y eventos de canales.

La instancia existente de Supabase ya tiene estas migraciones aplicadas. Para instalar en una base nueva se usa `npm run prisma:deploy`. El SQL original de creación se conserva como historial y contiene borrados: no se utiliza para actualizar la base actual.

En una base recién creada y vacía, los datos institucionales iniciales pueden cargarse desde `src/database/seeds/001_datos_iniciales.sql`. Ese seed corresponde a una carga inicial única y no crea cuentas ni contraseñas.

```bash
npm run db:check
npm run prisma:status
```

## Verificación

```bash
npm run build
npm run lint
```

Por pedido de la cátedra, el proyecto no incluye archivos de pruebas automáticas (`*.spec.ts`): el código queda limpio, solo con lo que usa la aplicación. Además, `nest-cli.json` tiene `generateOptions.spec: false`, así los recursos nuevos que se generen con `nest g` tampoco crean esos archivos. El sistema se verifica compilando, con ESLint y con la colección de Postman, que prueba cada módulo, las validaciones de los DTO y la autenticación.

La colección [AIda-backend.postman_collection.json](postman/AIda-backend.postman_collection.json) tiene una carpeta por módulo (AUTH, USUARIOS, CARRERAS, MATERIAS, MESAS DE EXAMEN, CHAT, DERIVACIONES…) y una carpeta final de LIMPIEZA: 109 pedidos y 248 comprobaciones. Ver [la guía de Postman](postman/README.md).

## Documentación

- [Contratos, módulos y configuración](docs/backend.md).
- [Registro de verificaciones](docs/verificacion-backend.md).
- [Historial de los trabajos prácticos](docs/trabajos-practicos.md).

## Integrantes

- Lazarte, Jorge Exequiel.
- Díaz, Juan Gabriel.

## Flujo de trabajo

Cada funcionalidad se desarrolla en una rama, se revisa mediante PR hacia `dev` y luego se integra a `main`. El código de esta ampliación se encuentra en `feature/integracion-modulos` hasta su revisión y publicación.
