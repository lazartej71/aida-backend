# Backend completo en Postman

La carpeta **Backend completo** de `AIda-backend.postman_collection.json` contiene 90 pedidos y 208 comprobaciones. Incluye autenticación, permisos, los nueve CRUD, correlatividades, versiones documentales, chat privado, recuperación de evidencia, derivación, resolución, métricas, cierre de sesión y eliminación de los registros creados.

## Preparación

1. Iniciar el backend y comprobar `GET /salud`.
2. Registrar una cuenta con `POST /auth/register`.
3. Promover esa cuenta con `npm run usuarios:admin -- su-correo`.
4. Importar la colección en Postman.
5. Crear un entorno local con `baseUrl`, `adminEmail` y `adminPassword`. No guardar las credenciales reales en el archivo de la colección.
6. Seleccionar la carpeta **Backend completo** y ejecutarla completa en orden con Collection Runner.

La carpeta inicia sesión del administrador, registra un alumno de prueba y guarda tokens e identificadores como variables de colección. Los IDs proceden de las respuestas de creación: no utiliza los IDs fijos de los datos institucionales. Los pedidos finales eliminan únicamente esas entidades de prueba.

Si la ejecución se interrumpe, revisar los registros creados antes de repetirla: la limpieza final puede no haberse ejecutado. Los nombres y el correo incluyen un identificador único de esa ejecución. No ejecutar pedidos de baja sueltos con variables modificadas manualmente.

Para utilizar Newman con un archivo de entorno local:

```bash
npx --yes newman run postman/AIda-backend.postman_collection.json --folder "Backend completo" --environment ruta-al-entorno-local.json
```

Ese archivo puede contener credenciales y se mantiene fuera del repositorio. Antes de exportar o compartir Postman, vaciar los tokens y credenciales guardados. El servidor revoca los JWT del alumno de prueba al cerrar sus sesiones.

La carpeta **Autenticación (TP12)** conserva los 11 pedidos específicos de registro y login. A diferencia del recorrido completo, ese flujo conserva la cuenta creada para poder seguir probándola manualmente.
