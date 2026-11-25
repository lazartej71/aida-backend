# Verificación del backend

## Comprobaciones realizadas

| Comprobación                              | Resultado                                       |
| ----------------------------------------- | ----------------------------------------------- |
| Compilación y generación de Prisma Client | Correctas                                       |
| ESLint                                    | Sin errores                                     |
| Postman contra Supabase                   | 109 pedidos y 248 comprobaciones aprobadas      |
| Limpieza después de la prueba real        | Conteos originales conservados en las 18 tablas |
| Migraciones de Supabase                   | Cuatro migraciones aplicadas; esquema al día    |
| Documento OpenAPI generado                | 47 rutas documentadas                           |

La colección de Postman comprueba CRUD, relaciones, fechas, unicidad, ciclos, permisos, JWT, revocación, bloqueo del último administrador, documentos vigentes, versiones, conversaciones privadas, derivación y métricas. No se realizaron envíos comerciales de WhatsApp ni llamadas a un proveedor de IA contratado, porque no hay cuentas configuradas.

Por pedido de la cátedra, el repositorio no incluye archivos de pruebas automáticas (`*.spec.ts`).

La colección completa de Postman usa cuentas y registros temporales. El ejecutor de verificación elimina esos registros incluso ante fallos y compara los conteos de las 18 tablas con los valores anteriores a la ejecución.

La ejecución contra Supabase finalizó el 24 de noviembre de 2026. Se comprobó también la generación de OpenAPI y las cabeceras de seguridad y de CORS del servidor configurado. Los tokens, contraseñas y claves permanecieron fuera de los archivos versionados.
