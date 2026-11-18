-- AIda - Verificación de la base de datos (PostgreSQL)
-- Se ejecuta después de crear las tablas y cargar los datos iniciales.

-- 1. Cantidad de registros por tabla: todas tienen que tener 5 o más
SELECT 'documentos' AS tabla, count(*) AS registros FROM documentos
UNION ALL SELECT 'carreras', count(*) FROM carreras
UNION ALL SELECT 'materias', count(*) FROM materias
UNION ALL SELECT 'correlatividades', count(*) FROM correlatividades
UNION ALL SELECT 'mesas_examen', count(*) FROM mesas_examen
UNION ALL SELECT 'periodos_inscripcion', count(*) FROM periodos_inscripcion
UNION ALL SELECT 'eventos_academicos', count(*) FROM eventos_academicos
UNION ALL SELECT 'info_ingreso', count(*) FROM info_ingreso
UNION ALL SELECT 'tramites', count(*) FROM tramites
UNION ALL SELECT 'preguntas_frecuentes', count(*) FROM preguntas_frecuentes
UNION ALL SELECT 'conversaciones', count(*) FROM conversaciones
UNION ALL SELECT 'mensajes', count(*) FROM mensajes
UNION ALL SELECT 'derivaciones', count(*) FROM derivaciones
ORDER BY tabla;

-- 2. Materias con su carrera (relación carreras 1 a N materias)
SELECT c.nombre AS carrera, m.nivel, m.codigo, m.nombre AS materia
FROM materias m
JOIN carreras c ON c.id = m.carrera_id
ORDER BY m.nivel, m.codigo;

-- 3. Correlatividades legibles (relación de materias consigo misma)
SELECT m.nombre AS materia, co.para, co.condicion, r.nombre AS requiere
FROM correlatividades co
JOIN materias m ON m.id = co.materia_id
JOIN materias r ON r.id = co.requiere_id
ORDER BY m.codigo, co.para, r.codigo;

-- 4. Mesas de examen con su materia y el documento que las respalda
SELECT me.turno, me.llamado, me.fecha, me.cierre_inscripcion, ma.nombre AS materia, d.numero AS resolucion
FROM mesas_examen me
JOIN materias ma ON ma.id = me.materia_id
LEFT JOIN documentos d ON d.id = me.documento_id
ORDER BY me.fecha;

-- 5. Preguntas frecuentes con su fuente
SELECT p.categoria, p.pregunta, coalesce(d.titulo, 'sin documento') AS fuente
FROM preguntas_frecuentes p
LEFT JOIN documentos d ON d.id = p.documento_id
ORDER BY p.categoria;

-- 6. Conversaciones con su cantidad de mensajes y si fueron derivadas
SELECT c.id, c.canal, c.estado,
       count(DISTINCT m.id) AS mensajes,
       count(DISTINCT d.id) AS derivaciones
FROM conversaciones c
LEFT JOIN mensajes m ON m.conversacion_id = c.id
LEFT JOIN derivaciones d ON d.conversacion_id = c.id
GROUP BY c.id
ORDER BY c.id;

-- 7. Integridad: ninguna clave foránea apunta a un registro inexistente (todas deben dar 0)
SELECT 'materias sin carrera' AS control, count(*) AS errores
FROM materias m LEFT JOIN carreras c ON c.id = m.carrera_id WHERE c.id IS NULL
UNION ALL
SELECT 'mensajes sin conversación', count(*)
FROM mensajes m LEFT JOIN conversaciones c ON c.id = m.conversacion_id WHERE c.id IS NULL
UNION ALL
SELECT 'derivaciones resueltas sin respuesta', count(*)
FROM derivaciones WHERE estado = 'RESUELTA' AND respuesta IS NULL;

-- 8. Pruebas de restricciones: cada una TIENE QUE FALLAR con un error.
-- Están comentadas porque cortan el script; se prueban de a una, quitando el "--".

-- Clave foránea: no existe la carrera 999
-- INSERT INTO materias (carrera_id, codigo, nombre, nivel) VALUES (999, 99, 'Materia inexistente', 1);

-- CHECK: una materia no puede ser correlativa de sí misma
-- INSERT INTO correlatividades (materia_id, requiere_id, para, condicion) VALUES (1, 1, 'CURSAR', 'REGULAR');

-- CHECK: el cierre de inscripción tiene que ser antes del examen
-- INSERT INTO mesas_examen (materia_id, turno, llamado, fecha, cierre_inscripcion) VALUES (1, 1, 'I', '2026-05-11', '2026-05-20');

-- CHECK: el llamado solo puede ser I, II o III
-- INSERT INTO mesas_examen (materia_id, turno, llamado, fecha, cierre_inscripcion) VALUES (1, 1, 'IV', '2026-05-11', '2026-05-07');

-- UNIQUE: no puede haber dos carreras con el mismo nombre
-- INSERT INTO carreras (nombre, tipo) VALUES ('Ingeniería Civil', 'GRADO');

-- CHECK: una derivación resuelta necesita respuesta
-- INSERT INTO derivaciones (conversacion_id, motivo, estado) VALUES (1, 'Prueba', 'RESUELTA');
