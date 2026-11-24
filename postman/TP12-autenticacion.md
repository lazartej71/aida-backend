# TP12: pruebas de registro y login en Postman

1. Configurar el `.env` del backend con `DATABASE_URL` y un `JWT_SECRET` privado de al menos 32 bytes. El archivo local ya tiene el secreto generado; no copiarlo a Postman.
2. Aplicar las migraciones con `npm run prisma:deploy` e iniciar NestJS con `npm run start:dev`.
3. Importar `AIda-backend.postman_collection.json` en Postman.
4. Revisar `baseUrl` en las variables de la colección; por defecto es `http://localhost:3000`.
5. Seleccionar **Autenticación (TP12)** y ejecutar todos sus pedidos con **Run folder / Collection Runner**, en el orden indicado.

El primer pedido genera `authEmail` con un correo nuevo bajo `example.invalid`. `authPassword` contiene una contraseña de prueba reemplazable. Si hay variables de entorno con esos mismos nombres, prevalecen sobre las de la colección: quitarlas si se quiere usar la generación automática.

| Pedido                                | Estado esperado | Qué comprueba                                     |
| ------------------------------------- | --------------- | ------------------------------------------------- |
| 01 — Registrar usuario                | 201             | Id y datos públicos; sin contraseña ni hash       |
| 02 — Iniciar sesión                   | 200             | JWT, identidad del usuario y vigencia de una hora |
| 03 — Repetir registro                 | 409             | Correo único                                      |
| 04 — Contraseña incorrecta            | 401             | No se entrega JWT                                 |
| 05 — Usuario inexistente              | 401             | Credenciales rechazadas                           |
| 06 — Correo inválido                  | 400             | Validación del email                              |
| 07 — Contraseña corta                 | 400             | Mínimo de 8 caracteres                            |
| 08 — Campo `rol` adicional            | 400             | No se aceptan campos inesperados                  |
| 09 — Contraseña ausente               | 400             | Validación del login                              |
| 10 — Registro por `/usuarios`         | 404             | Existe una única ruta de registro                 |
| 11 — Contraseña UTF-8 demasiado larga | 400             | Bcrypt no trunca contraseñas de más de 72 bytes   |

El resultado esperado es **11 pedidos y 26 assertions aprobadas**, sin fallos. El script de login guarda el JWT en la variable `accessToken`; decodificar su contenido permite inspeccionarlo, pero no reemplaza la verificación criptográfica de la firma. Las pruebas HTTP del proyecto también verifican la firma, el rechazo de un token alterado y la normalización del correo.

Para probar individualmente, usar **Body → raw → JSON**:

```json
{
  "nombre": "Usuario de prueba TP12",
  "email": "alumno@example.invalid",
  "password": "PruebaTP12!2026"
}
```

Enviar ese cuerpo a `POST {{baseUrl}}/auth/register`. Para `POST {{baseUrl}}/auth/login`, enviar solamente `email` y `password`. No se necesita Authorization en esos dos pedidos.

Las pruebas manuales crean un usuario real y lo conservan en Supabase. Repetir el mismo registro devuelve 409; ejecutar toda la carpeta genera otro correo. No se agregó un endpoint público para borrar usuarios de prueba. Antes de exportar o compartir la colección, vaciar `accessToken` y cualquier credencial real guardada en las variables.

El backend actual protege los CRUD mediante guards y roles. Las cuentas creadas desde el registro público tienen rol ESTUDIANTE; para las operaciones del personal se necesita una cuenta promovida por un administrador. El alcance original del TP12 se conserva en el historial de trabajos prácticos.

## Resultado de la ejecución contra Supabase

La carpeta se ejecutó mediante Newman contra una instancia local de NestJS conectada a Supabase, con una cuenta temporal de correo único. Pasaron los 11 pedidos y las 26 assertions. También se verificaron por separado la contraseña contra el hash persistido y la firma criptográfica del JWT, incluida su vigencia de una hora. La cuenta temporal se eliminó al terminar y no se guardaron tokens ni contraseñas reales en la colección o en este informe.
