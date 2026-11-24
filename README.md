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

## Asistente sin proveedores externos

El modo local funciona con la información almacenada: consulta datos académicos y busca preguntas, trámites y fragmentos de documentos vigentes. Las respuestas incluyen la evidencia utilizada. Si falta respaldo suficiente, registra una derivación para el personal.

Los documentos se indexan mediante `POST /documentos/:id/contenido`, enviando texto institucional. Cada carga crea una versión y mantiene el historial. La recuperación utiliza la última versión y respeta la vigencia del documento.

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

## Pruebas

```bash
npm run build
npm run lint
npm test
npm run test:e2e
```

Las pruebas de integración crean PostgreSQL aislado en memoria con PGlite, aplican las migraciones y utilizan Prisma y los módulos reales. Se ejecutan sin modificar Supabase ni necesitar sus credenciales. El workflow de GitHub Actions ejecuta estas comprobaciones en los PR hacia `dev` y `main`.

La colección [AIda-backend.postman_collection.json](postman/AIda-backend.postman_collection.json) incluye la carpeta del TP12 y **Backend completo**, con 90 pedidos y 208 comprobaciones. Ver [la guía del backend en Postman](postman/Backend-completo.md). Los pedidos completos crean sus propios registros y los eliminan al finalizar.

## Documentación

- [Contratos, módulos y configuración](docs/backend.md).
- [Registro de verificaciones](docs/verificacion-backend.md).
- [Historial de los trabajos prácticos](docs/trabajos-practicos.md).

## Integrantes

- Lazarte, Jorge Exequiel.
- Díaz, Juan Gabriel.

## Flujo de trabajo

Cada funcionalidad se desarrolla en una rama, se revisa mediante PR hacia `dev` y luego se integra a `main`. El código de esta ampliación se encuentra en `feature/completar-backend` hasta su revisión y publicación.
