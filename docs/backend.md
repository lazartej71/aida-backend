# Contratos del backend

## Recursos y listados

Los recursos `carreras`, `materias`, `mesas-examen`, `inscripciones`, `calendario-academico`, `ingreso`, `tramites`, `documentos` y `preguntas-frecuentes` exponen `GET /`, `GET /:id`, `POST /`, `PATCH /:id` y `DELETE /:id` bajo su ruta base. Las operaciones usan Prisma y devuelven JSON.

Los listados devuelven:

```json
{
  "datos": [],
  "total": 0,
  "pagina": 1,
  "limite": 20
}
```

`pagina` empieza en 1 y `limite` admite de 1 a 100. Los campos de texto admiten `busqueda`. Materias filtra por `carreraId`, mesas por `materiaId`, las categorías correspondientes por `tipo` y preguntas frecuentes por `categoria`. Conversaciones y derivaciones admiten `estado`; derivaciones también acepta `conversacionId`.

Las fechas de calendario se envían como `AAAA-MM-DD` y se guardan sin desplazamiento de zona horaria. Las actualizaciones parciales validan el rango combinado con los datos actuales. El cierre de inscripción de una mesa debe ser anterior al examen.

Los errores de unicidad y relaciones se traducen a 409; un registro inexistente a 404; las validaciones a 400. Los errores internos no devuelven SQL, hashes o detalles de conexión.

## Autenticación y usuarios

| Ruta                                  | Acceso  | Comportamiento                                                              |
| ------------------------------------- | ------- | --------------------------------------------------------------------------- |
| `POST /auth/register`                 | Público | Registro con nombre, email y contraseña; devuelve usuario público, 201      |
| `POST /auth/login`                    | Público | Verifica bcrypt y devuelve JWT y usuario, 200                               |
| `GET /auth/me`                        | Sesión  | Datos de la cuenta actual                                                   |
| `PATCH /auth/me`                      | Sesión  | Modifica nombre o correo y revoca sesiones previas                          |
| `POST /auth/password`                 | Sesión  | Recibe `passwordActual` y `passwordNueva`; cambia el hash y revoca sesiones |
| `POST /auth/logout`                   | Sesión  | Revoca todas las sesiones de esa cuenta                                     |
| `GET /usuarios` y `GET /usuarios/:id` | ADMIN   | Consulta cuentas con proyección pública                                     |
| `PATCH /usuarios/:id`                 | ADMIN   | Nombre, email, rol o estado activo                                          |
| `DELETE /usuarios/:id`                | ADMIN   | Elimina una cuenta conservando la regla del último administrador            |

El único registro es `/auth/register`. `POST /usuarios` devuelve 404. La contraseña tiene entre 8 caracteres y 72 bytes UTF-8; el hash usa bcrypt con costo 12. El correo se recorta y normaliza a minúsculas. El índice único resuelve registros concurrentes con el mismo correo.

Los JWT usan HS256 e incluyen `sub`, `email`, `version`, `iat` y `exp`. El guard consulta la cuenta en cada pedido: un rol escrito manualmente en el payload no cambia los permisos. La versión del token permite invalidar sesiones inmediatamente. RLS está activado en las tablas; la autorización de la API se aplica en NestJS, incluso cuando la conexión PostgreSQL utiliza un usuario que puede omitir RLS.

Existe un límite por IP y operación en memoria: 20 registros, 30 logins y 60 pedidos POST restantes por minuto. Este límite corresponde a una instancia del servidor. Para varias instancias se debe compartir el almacenamiento del límite o configurarlo en la infraestructura. Los cuerpos JSON admiten hasta 512 KB y cada DTO tiene sus propios límites. CORS usa los orígenes explícitos de `CORS_ORIGINS`.

## Correlatividades

- `GET /materias/:id/correlatividades`: público.
- `PUT /materias/:id/correlatividades`: personal; recibe `requiereId`, `para` (`CURSAR` o `RENDIR`) y `condicion` (`REGULAR` o `APROBADA`). Crea o actualiza esa relación.
- `DELETE /materias/:id/correlatividades/:requiereId/:para`: personal.

El requisito debe pertenecer a la misma carrera, ser una materia distinta y no producir un ciclo para el destino elegido. La comprobación y escritura se realizan en una transacción serializable.

## Documentos

`POST /documentos/:id/contenido` recibe `{ "contenido": "texto institucional" }`, con un máximo de 100.000 caracteres. Requiere personal autorizado. Se guarda la versión completa y fragmentos solapados para la búsqueda PostgreSQL en español. El historial no se sobrescribe.

`GET /documentos/:id/versiones` devuelve los metadatos del historial y `GET /documentos/:id/versiones/:numero` su contenido. Ambos requieren personal autorizado. Las consultas del asistente usan exclusivamente la versión actual dentro de la vigencia configurada.

El ingreso de contenido es textual. Los enlaces a PDF se guardan como fuentes; la extracción automática de PDF, OCR y descarga de archivos no forman parte del contrato actual.

## Chat y derivaciones

| Ruta                                                                        | Acceso                        |
| --------------------------------------------------------------------------- | ----------------------------- |
| `POST /chat` con `{ "canal": "WEB", "mensaje": "..." }`                     | Público                       |
| `POST /canales/web` con `{ "mensaje": "..." }`                              | Público                       |
| `GET /chat/:id`                                                             | Token privado de conversación |
| `POST /chat/:id/mensajes` con `{ "mensaje": "..." }`                        | Token privado de conversación |
| `POST /chat/:id/cerrar`                                                     | Token privado de conversación |
| `GET /chat`, `GET /chat/:id/gestion`, `PATCH /chat/:id`, `DELETE /chat/:id` | Personal                      |

La creación devuelve `id`, `tokenConversacion`, mensajes, respuesta, estrategia, fuentes y si fue derivada. Guardar el token y enviarlo en `x-conversacion-token`. La base guarda su hash SHA-256 y las respuestas nunca exponen ese hash. Las lecturas devuelven los últimos 100 mensajes en orden cronológico.

Cada respuesta registra la consulta, estrategia, tiempo, proveedor y fuentes. La inserción de mensajes, métricas y una eventual derivación es transaccional. Se serializan las escrituras de una misma conversación y se comprueba que siga abierta antes de persistirlas.

La abstención crea una derivación pendiente si esa conversación no tiene otra activa. `derivaciones` tiene CRUD protegido; resolver exige respuesta no vacía y registra la fecha. Esa respuesta se agrega al historial del chat. Cambiar la derivación a un estado abierto limpia su fecha de resolución.

## Estrategias e IA

1. **Datos exactos:** consulta carreras activas, correlatividades y próximas fechas registradas. Una materia ambigua no se selecciona arbitrariamente.
2. **Recuperación documental:** compara preguntas frecuentes y trámites y busca fragmentos mediante full-text search de PostgreSQL. Descarta fuentes fuera de vigencia y versiones reemplazadas.
3. **Abstención:** informa falta de evidencia y deriva la consulta.

La normalización y similitud locales son textuales. No utilizan embeddings de un modelo entrenado ni sustituyen una revisión del contenido institucional. Los candidatos tienen límites de búsqueda: hasta 1.000 materias para identificar nombres, 500 preguntas y trámites, y 10 fragmentos documentales candidatos.

`GET /asistente/estado` y `GET /ia/estado` requieren personal y muestran las capacidades configuradas sin revelar secretos.

### Proveedor HTTP opcional

Configurar `IA_ENDPOINT` (HTTPS) e `IA_API_KEY` habilita un adaptador con este contrato:

```json
{
  "instrucciones": "...",
  "consulta": "...",
  "evidencias": [{ "id": "faq:1", "titulo": "...", "texto": "..." }]
}
```

La respuesta esperada es `{ "evidenciaId": "faq:1" }` o `{ "evidenciaId": null }`. Se envía la clave como Bearer. Solo se aceptan identificadores de las evidencias suministradas y se devuelve su texto registrado. Un error, tiempo de espera o respuesta inválida mantiene la selección local. El límite es de 8 segundos y 10 KB de respuesta.

Este contrato requiere un adaptador del proveedor elegido; no es una URL intercambiable directamente por cualquier API comercial. Sin credenciales se utiliza recuperación local y no se realizan llamadas externas.

## WhatsApp

El adaptador implementa los webhooks de texto de WhatsApp Cloud API:

- `GET /canales/whatsapp`: valida `hub.mode`, `hub.verify_token` y devuelve `hub.challenge`.
- `POST /canales/whatsapp`: verifica HMAC-SHA256 sobre el cuerpo original usando `X-Hub-Signature-256` antes de procesar mensajes.
- Los mensajes entrantes usan el mismo servicio de chat. Se conserva un hash del remitente y se reutiliza su conversación abierta.
- El identificador externo deduplica eventos ya enviados. La respuesta preparada se conserva para reintentos de envío.
- `GET /canales/estado` y `GET /canales/eventos` requieren personal y muestran configuración y entregas.

Requiere `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_GRAPH_VERSION`. La versión se configura con la disponible en la cuenta de Meta, por ejemplo con formato `vNN.0`. El callback debe ser público y HTTPS en el entorno de despliegue.

Sin estas credenciales el webhook devuelve 503. Las pruebas actuales verifican firma, suscripción, deduplicación y ausencia de envíos sin configuración. El envío real debe validarse al disponer de una cuenta de Meta. Un fallo de red después de que Meta acepte un envío puede dejar su resultado incierto; no se promete entrega exactamente una vez.

Referencia: [webhooks de Meta](https://developers.facebook.com/docs/graph-api/webhooks/getting-started/).

## Métricas

`GET /metricas/resumen?dias=30` admite entre 1 y 365 días y devuelve conversaciones, mensajes, derivaciones pendientes, estrategias, tiempos y consultas frecuentes. Las frecuencias se calculan sobre las últimas 5.000 consultas del período e indican el tamaño de la muestra. `GET /metricas/consultas` pagina los registros individuales.

Los costos devuelven `null` porque no hay una tarifa de proveedor configurada. Los tiempos de respuesta y los conteos se registran; los tokens solo se incluyen cuando existe un dato medido. No se generan cifras de consumo ficticias.

## Migraciones e instalación

Para una base nueva: `npm run prisma:deploy`. Para la instancia existente, consultar `npm run prisma:status`: las tres migraciones ya están registradas. No ejecutar el SQL antiguo de creación, que contiene `DROP TABLE`, ni registrar de nuevo `0_init` en una base ya administrada por Prisma.

`migrate dev` se reserva para una base de desarrollo con su shadow database independiente. Las migraciones adicionales se revisan antes de aplicarse a Supabase. El comando `db:check` solo lee las 18 tablas y su estado de RLS.
