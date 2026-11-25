# Colección de Postman

`AIda-backend.postman_collection.json` tiene todos los pedidos de la API, ordenados con **una carpeta por módulo**. Cada carpeta tiene los pedidos de su recurso (crear, listar, consultar, actualizar) y los casos de error con su código esperado. Cada pedido tiene comprobaciones automáticas: el código de respuesta, los datos devueltos y que nunca aparezcan contraseñas ni hashes.

## Carpetas

| Carpeta                                                                                              | Qué contiene                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **AUTH**                                                                                             | Inicio de sesión del administrador, registro y login de un alumno de prueba, perfil propio y cierre de sesión. Subcarpetas: **VALIDACIONES DE REGISTRO Y LOGIN** (errores 400, 401 y 409 con los mensajes del DTO) y **PERMISOS** (401 sin token y 403 con un rol sin permiso) |
| **USUARIOS**                                                                                         | Listar, consultar y actualizar usuarios (solo ADMIN), sin exponer la contraseña                                                                                                                                                                                                |
| **DOCUMENTOS**                                                                                       | CRUD de documentos oficiales, carga de su texto y versiones                                                                                                                                                                                                                    |
| **CARRERAS**                                                                                         | CRUD de carreras y un ejemplo de datos inválidos                                                                                                                                                                                                                               |
| **MATERIAS**                                                                                         | CRUD de materias y correlatividades (incluye el rechazo de un ciclo)                                                                                                                                                                                                           |
| **MESAS DE EXAMEN**                                                                                  | CRUD de mesas y el rechazo de un cierre posterior al examen                                                                                                                                                                                                                    |
| **INSCRIPCIONES** · **CALENDARIO ACADÉMICO** · **INGRESO** · **TRÁMITES** · **PREGUNTAS FRECUENTES** | CRUD de cada recurso                                                                                                                                                                                                                                                           |
| **CHAT**                                                                                             | Conversación con el asistente: saludo, respuesta con documento y con datos exactos, privacidad del chat, derivación y cierre                                                                                                                                                   |
| **DERIVACIONES**                                                                                     | Resolución de una consulta derivada por el personal                                                                                                                                                                                                                            |
| **MÉTRICAS Y ESTADO**                                                                                | Métricas de uso y estado del asistente y de los canales                                                                                                                                                                                                                        |
| **LIMPIEZA**                                                                                         | Borra todo lo que creó la colección, en orden inverso, y verifica cada baja                                                                                                                                                                                                    |

## Cómo ejecutarla

1. Levantar el backend (`npm run start:dev`) y comprobar `GET /salud`.
2. En Postman, **Import** y elegir el archivo de la colección.
3. Crear un **entorno** con `baseUrl` (por ejemplo `http://localhost:3000`), `adminEmail` y `adminPassword` de una cuenta administradora. Las credenciales van solo en el entorno, nunca en la colección.
4. Ejecutar la colección completa en orden con **Run collection**.

AUTH inicia la sesión del administrador y crea un alumno de prueba; cada carpeta crea sus propios registros con un identificador único de esa ejecución; LIMPIEZA los borra al final. Por eso la colección no usa los ids fijos de los datos reales y se puede ejecutar contra Supabase sin tocarlos. Si la ejecución se corta antes de LIMPIEZA, conviene correr esa carpeta sola.

Para probar un pedido suelto (por ejemplo, en una demostración), primero ejecutar **AUTH → Iniciar sesión del administrador**, que guarda el token en la variable `adminToken`.

Desde la terminal, con Newman:

```bash
npx --yes newman run postman/AIda-backend.postman_collection.json \
  --env-var "baseUrl=http://localhost:3000" \
  --env-var "adminEmail=correo-del-admin" --env-var "adminPassword=su-contraseña"
```

Última ejecución completa contra Supabase (25/11/2026): **109 pedidos y 248 comprobaciones aprobadas**, sin fallos, y la base quedó con los mismos registros que antes de empezar.
