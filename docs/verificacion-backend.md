# Verificación del backend

## Comprobaciones realizadas

| Comprobación                              | Resultado                                       |
| ----------------------------------------- | ----------------------------------------------- |
| Compilación y generación de Prisma Client | Correctas                                       |
| ESLint                                    | Sin errores                                     |
| Pruebas unitarias                         | 55 aprobadas                                    |
| Pruebas HTTP e integración                | 44 aprobadas                                    |
| Postman con PostgreSQL aislado            | 90 pedidos y 208 comprobaciones aprobadas       |
| Postman contra Supabase                   | 90 pedidos y 208 comprobaciones aprobadas       |
| Limpieza después de la prueba real        | Conteos originales conservados en las 18 tablas |
| Migraciones de Supabase                   | Tres migraciones aplicadas; esquema actualizado |
| Documento OpenAPI generado                | 47 rutas documentadas                           |

La base aislada se crea con PGlite, aplica las tres migraciones y utiliza los servicios de Prisma y NestJS reales. Se comprueban CRUD, relaciones, fechas, unicidad, ciclos, permisos, JWT, revocación, bloqueo del último administrador, documentos vigentes, versiones, conversaciones privadas, derivación y métricas.

Las pruebas de proveedores externos verifican la validación de firmas de WhatsApp y la selección de evidencia mediante respuestas simuladas. No se realizaron envíos comerciales ni llamadas a un proveedor contratado, porque no hay cuentas configuradas.

La colección completa de Postman usa cuentas y registros temporales. El ejecutor de verificación elimina esos registros incluso ante fallos y compara los conteos de las 18 tablas con los valores anteriores a la ejecución.

La ejecución contra Supabase finalizó el 24 de noviembre de 2026. Se comprobó también la generación de OpenAPI y las cabeceras de seguridad y de CORS del servidor configurado. Los tokens, contraseñas y claves permanecieron fuera de los archivos versionados.

El workflow de GitHub Actions está preparado para ejecutar compilación, lint y pruebas en los PR. Estos resultados corresponden a la ejecución local; no se presentan como una ejecución de CI remota.
