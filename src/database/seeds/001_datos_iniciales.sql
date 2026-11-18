-- AIda - Datos iniciales (PostgreSQL)
-- Carga al menos 5 registros por tabla. Se ejecuta después de 001_crear_tablas.sql,
-- sobre las tablas recién creadas.
--
-- Fuentes de los datos institucionales (sitio oficial de la UTN FRT):
--   - Calendario Académico 2026, Resolución 2394/2025 del Consejo Directivo
--   - Plan de estudio de Ingeniería en Sistemas de Información 2023
--   - Seminario de Ingreso Universitario 2027 (ingreso.frt.utn.edu.ar)
-- Las correlatividades se leyeron del PDF escaneado del plan: conviene verificarlas
-- contra el plan oficial. Las conversaciones, mensajes y derivaciones son de ejemplo.

BEGIN;

-- Documentos oficiales
INSERT INTO documentos (titulo, tipo, numero, url, vigente_desde, vigente_hasta) VALUES
  ('Calendario Académico 2026 - Carreras de grado', 'RESOLUCION', '2394/2025',
   'https://frt.utn.edu.ar/wp-content/uploads/2025/11/CALENDARIO-ACADEMICO-2026.-Resol.-2394.pdf',
   '2026-03-09', '2027-03-31'),
  ('Calendario Académico 2026 - Licenciaturas y Tecnicaturas', 'RESOLUCION', '2395/2025',
   'https://frt.utn.edu.ar/wp-content/uploads/2025/11/CALENDARIO-ACADEMICO-2026.-Lic.-y-Tec.-Resol.-2395.pdf',
   NULL, NULL),
  ('Modificación del Calendario Académico 2026 (5° y 6° turno de exámenes)', 'RESOLUCION', '1215/2026',
   'https://frt.utn.edu.ar/wp-content/uploads/2026/06/Modificacion-del-Calendario-Academico-2394.25.-Resol.-1215.pdf',
   NULL, NULL),
  ('Plan de estudio de Ingeniería en Sistemas de Información 2023', 'PLAN_DE_ESTUDIO', NULL,
   'https://frt.utn.edu.ar/wp-content/uploads/2026/09/planEstudio-ISI-2023.pdf',
   NULL, NULL),
  ('Diseño curricular de Ingeniería en Sistemas de Información', 'ORDENANZA', '1877',
   'http://csu.rec.utn.edu.ar/CSU/ORD/1877.pdf', NULL, NULL),
  ('Reglamento de Estudios', 'ORDENANZA', '1549', NULL, NULL, NULL),
  ('Seminario de Ingreso Universitario 2027', 'OTRO', NULL,
   'https://ingreso.frt.utn.edu.ar/ingreso-2027/', NULL, NULL);

-- Carreras (la duración y el plan solo figuran donde la página oficial los publica)
INSERT INTO carreras (nombre, tipo, duracion_anios, plan) VALUES
  ('Ingeniería en Sistemas de Información', 'GRADO', 5, '2023'),
  ('Ingeniería Electrónica', 'GRADO', NULL, NULL),
  ('Ingeniería Mecánica', 'GRADO', NULL, NULL),
  ('Ingeniería Civil', 'GRADO', NULL, NULL),
  ('Ingeniería en Energía Eléctrica', 'GRADO', NULL, NULL),
  ('Tecnicatura Universitaria en Programación', 'PREGRADO', NULL, NULL),
  ('Tecnicatura Universitaria en Mecatrónica', 'PREGRADO', NULL, NULL),
  ('Tecnicatura Universitaria en Logística', 'PREGRADO', NULL, NULL);

-- Materias de los tres primeros niveles de Ingeniería en Sistemas de Información (plan 2023)
INSERT INTO materias (carrera_id, codigo, nombre, nivel)
SELECT c.id, m.codigo, m.nombre, m.nivel
FROM carreras c
CROSS JOIN (VALUES
  (1, 'Análisis Matemático I', 1),
  (2, 'Álgebra y Geometría Analítica', 1),
  (3, 'Física I', 1),
  (4, 'Ingeniería y Sociedad', 1),
  (5, 'Lógica y Estructuras Discretas', 1),
  (6, 'Algoritmos y Estructuras de Datos', 1),
  (7, 'Arquitectura de Computadoras', 1),
  (8, 'Sistemas y Procesos de Negocios', 1),
  (9, 'Análisis Matemático II', 2),
  (10, 'Física II', 2),
  (11, 'Inglés I', 2),
  (12, 'Sintaxis y Semántica de los Lenguajes', 2),
  (13, 'Paradigmas de Programación', 2),
  (14, 'Sistemas Operativos', 2),
  (15, 'Análisis de Sistemas de Información', 2),
  (16, 'Inglés II', 3),
  (17, 'Probabilidad y Estadística', 3),
  (18, 'Economía', 3),
  (19, 'Bases de Datos', 3),
  (20, 'Desarrollo de Software', 3),
  (21, 'Comunicación de Datos', 3),
  (22, 'Análisis Numérico', 3),
  (23, 'Diseño de Sistemas de Información', 3)
) AS m (codigo, nombre, nivel)
WHERE c.nombre = 'Ingeniería en Sistemas de Información';

-- Correlatividades (por código de materia dentro de la carrera)
INSERT INTO correlatividades (materia_id, requiere_id, para, condicion)
SELECT materia.id, requerida.id, c.para, c.condicion
FROM (VALUES
  -- Para cursar: materias que tienen que estar cursadas (regulares)
  (9, 1, 'CURSAR', 'REGULAR'),   -- Análisis Matemático II requiere Análisis Matemático I
  (9, 2, 'CURSAR', 'REGULAR'),   -- Análisis Matemático II requiere Álgebra y Geometría Analítica
  (10, 1, 'CURSAR', 'REGULAR'),  -- Física II requiere Análisis Matemático I
  (10, 3, 'CURSAR', 'REGULAR'),  -- Física II requiere Física I
  (12, 5, 'CURSAR', 'REGULAR'),  -- Sintaxis y Semántica requiere Lógica y Estructuras Discretas
  (12, 6, 'CURSAR', 'REGULAR'),  -- Sintaxis y Semántica requiere Algoritmos y Estructuras de Datos
  (13, 5, 'CURSAR', 'REGULAR'),  -- Paradigmas requiere Lógica y Estructuras Discretas
  (13, 6, 'CURSAR', 'REGULAR'),  -- Paradigmas requiere Algoritmos y Estructuras de Datos
  (14, 7, 'CURSAR', 'REGULAR'),  -- Sistemas Operativos requiere Arquitectura de Computadoras
  (15, 6, 'CURSAR', 'REGULAR'),  -- Análisis de SI requiere Algoritmos y Estructuras de Datos
  (15, 8, 'CURSAR', 'REGULAR'),  -- Análisis de SI requiere Sistemas y Procesos de Negocios
  (16, 11, 'CURSAR', 'REGULAR'), -- Inglés II requiere Inglés I
  (17, 1, 'CURSAR', 'REGULAR'),  -- Probabilidad y Estadística requiere Análisis Matemático I
  (17, 2, 'CURSAR', 'REGULAR'),  -- Probabilidad y Estadística requiere Álgebra y Geometría Analítica
  (19, 12, 'CURSAR', 'REGULAR'), -- Bases de Datos requiere Sintaxis y Semántica
  (19, 15, 'CURSAR', 'REGULAR'), -- Bases de Datos requiere Análisis de SI
  (19, 5, 'CURSAR', 'APROBADA'), -- Bases de Datos requiere Lógica aprobada
  (19, 6, 'CURSAR', 'APROBADA'), -- Bases de Datos requiere Algoritmos aprobada
  (20, 13, 'CURSAR', 'REGULAR'), -- Desarrollo de Software requiere Paradigmas
  (20, 15, 'CURSAR', 'REGULAR'), -- Desarrollo de Software requiere Análisis de SI
  (20, 5, 'CURSAR', 'APROBADA'), -- Desarrollo de Software requiere Lógica aprobada
  (20, 6, 'CURSAR', 'APROBADA'), -- Desarrollo de Software requiere Algoritmos aprobada
  -- Para rendir: materias que tienen que estar aprobadas
  (9, 1, 'RENDIR', 'APROBADA'),  -- Análisis Matemático II: Análisis Matemático I aprobada
  (9, 2, 'RENDIR', 'APROBADA'),  -- Análisis Matemático II: Álgebra y Geometría Analítica aprobada
  (10, 1, 'RENDIR', 'APROBADA'), -- Física II: Análisis Matemático I aprobada
  (10, 3, 'RENDIR', 'APROBADA')  -- Física II: Física I aprobada
) AS c (materia_codigo, requiere_codigo, para, condicion)
JOIN carreras carrera ON carrera.nombre = 'Ingeniería en Sistemas de Información'
JOIN materias materia ON materia.carrera_id = carrera.id AND materia.codigo = c.materia_codigo
JOIN materias requerida ON requerida.carrera_id = carrera.id AND requerida.codigo = c.requiere_codigo;

-- Mesas de examen: fechas del calendario 2026 (4° y 7° turno). En cada llamado se rinden
-- todas las materias; acá se cargan algunas
INSERT INTO mesas_examen (materia_id, turno, llamado, fecha, cierre_inscripcion, documento_id)
SELECT materia.id, m.turno, m.llamado, m.fecha::date, m.cierre::date,
       (SELECT id FROM documentos WHERE numero = '2394/2025')
FROM (VALUES
  ('Análisis Matemático I', 4, 'I', '2026-09-09', '2026-09-07'),
  ('Física I', 4, 'II', '2026-09-14', '2026-09-10'),
  ('Sistemas Operativos', 4, 'III', '2026-09-25', '2026-09-22'),
  ('Algoritmos y Estructuras de Datos', 7, 'I', '2026-12-14', '2026-12-10'),
  ('Bases de Datos', 7, 'II', '2026-12-16', '2026-12-14'),
  ('Paradigmas de Programación', 7, 'III', '2026-12-18', '2026-12-16')
) AS m (materia, turno, llamado, fecha, cierre)
JOIN materias materia ON materia.nombre = m.materia;

-- Períodos de inscripción al cursado 2026
INSERT INTO periodos_inscripcion (descripcion, tipo, nivel, fecha_desde, fecha_hasta, documento_id) VALUES
  ('Inscripción al cursado 2026 - 1° año', 'CURSADO', 1, '2026-03-23', '2026-03-24', NULL),
  ('Inscripción al cursado 2026 - 2° año', 'CURSADO', 2, '2026-03-24', '2026-03-25', NULL),
  ('Inscripción al cursado 2026 - 3° año', 'CURSADO', 3, '2026-03-25', '2026-03-26', NULL),
  ('Inscripción al cursado 2026 - 4° año', 'CURSADO', 4, '2026-03-26', '2026-03-27', NULL),
  ('Inscripción al cursado 2026 - 5° y 6° nivel', 'CURSADO', 5, '2026-03-27', '2026-03-28', NULL),
  ('Inscripción al cursado 2026 - todos los niveles', 'CURSADO', NULL, '2026-03-28', '2026-03-30', NULL),
  ('Inscripción a las asignaturas del 2° cuatrimestre', 'CURSADO', NULL, '2026-08-10', '2026-08-14',
   (SELECT id FROM documentos WHERE numero = '2394/2025'));

-- Eventos del calendario académico 2026
INSERT INTO eventos_academicos (titulo, tipo, fecha_desde, fecha_hasta, documento_id)
SELECT e.titulo, e.tipo, e.desde::date, e.hasta::date, (SELECT id FROM documentos WHERE numero = '2394/2025')
FROM (VALUES
  ('Clases del 1° cuatrimestre (16 semanas)', 'CLASES', '2026-03-30', '2026-07-31'),
  ('1ra prueba de suficiencia de Idioma Extranjero (Inglés I y II)', 'SUFICIENCIA', '2026-04-20', NULL),
  ('Receso académico de invierno', 'RECESO', '2026-07-13', '2026-07-24'),
  ('Clases del 2° cuatrimestre (16 semanas)', 'CLASES', '2026-08-18', '2026-12-04'),
  ('2da prueba de suficiencia de Idioma Extranjero (Inglés I y II)', 'SUFICIENCIA', '2026-10-05', NULL),
  ('Receso académico de verano', 'RECESO', '2027-01-01', '2027-02-11'),
  ('Finalización del período lectivo 2026', 'OTRO', '2027-03-31', NULL)
) AS e (titulo, tipo, desde, hasta);

-- Información para ingresantes 2027
INSERT INTO info_ingreso (titulo, descripcion, modalidad, inscripcion_desde, inscripcion_hasta) VALUES
  ('Seminario de Ingreso - Intensiva Febrero 2027',
   'Matemática, Física y Taller de Vocación y Vida Universitaria, en Casa Central (Rivadavia 1050) y en la Extensión Áulica Concepción. Inscripción del 15/11/2026 al 10/12/2026 y del 26/12/2026 al 31/01/2027. Exámenes: Física el 23/02/2027 (recuperación 02/03) y Matemática el 25/02/2027 (recuperación 04/03).',
   'PRESENCIAL', '2026-11-15', '2027-01-31'),
  ('Prueba de Suficiencia Diciembre 2026',
   'Para quienes adeudan el ingreso y para aspirantes. Matemática y Física. Exámenes: Física el 21/12/2026 y Matemática el 22/12/2026.',
   'LIBRE', '2026-12-11', '2026-12-17'),
  ('Prueba de Suficiencia Marzo 2027',
   'Matemática, Física y Taller. Exámenes: Matemática el 09/03/2027, Física el 11/03/2027 y Taller el 12/03/2027.',
   'LIBRE', '2027-03-02', '2027-03-08'),
  ('Condiciones de aprobación del seminario',
   'Asistir al 80 % de las clases teórico-prácticas, aprobar los parciales de Matemática y Física con nota mínima 6 (cada uno con recuperación) y aprobar el Taller con participación y cuestionario.',
   'PRESENCIAL', NULL, NULL),
  ('Documentación para inscribirse',
   'Constancia de finalización del secundario o constancia de cursado del último año, en PDF. El resto de la documentación se presenta en marzo de 2027 en el departamento alumnos.',
   NULL, NULL, NULL),
  ('Destinatarios del seminario',
   'Estudiantes con el secundario completo, alumnos del último año del secundario y mayores de 25 años con el secundario incompleto (Ordenanzas 874 y 1000 del Consejo Superior).',
   NULL, NULL, NULL);

-- Trámites con plazo en el calendario 2026 (la oficina no figura en el calendario)
INSERT INTO tramites (nombre, descripcion, oficina, plazo_desde, plazo_hasta, documento_id)
SELECT t.nombre, t.descripcion, NULL, t.desde::date, t.hasta::date, (SELECT id FROM documentos WHERE numero = '2394/2025')
FROM (VALUES
  ('Cambio de especialidad y/o cursado simultáneo',
   'Presentación de notas para cambiar de especialidad o cursar dos carreras en simultáneo.',
   '2026-03-09', '2026-03-27'),
  ('Inscripción fuera de término (1° cuatrimestre)',
   'Presentación de notas para inscripción fuera de término, cambio de comisión o ampliación de cupo.',
   '2026-04-06', '2026-04-17'),
  ('Baja de regularidad',
   'Presentación de notas para dar de baja la regularidad de una asignatura.',
   '2026-04-06', '2026-04-17'),
  ('Cambio de plan',
   'Presentación de notas para pasar a otro plan de estudios.',
   '2026-04-06', '2026-04-17'),
  ('Inscripción fuera de término (2° cuatrimestre)',
   'Presentación de notas para inscripción fuera de término en materias del 2° cuatrimestre, ampliación de cupo o baja de regularidad.',
   '2026-08-18', '2026-08-21'),
  ('Ingreso por equivalencia',
   'Solicitud de ingreso por equivalencia de materias aprobadas en otra carrera o institución.',
   NULL, '2026-10-31')
) AS t (nombre, descripcion, desde, hasta);

-- Preguntas frecuentes con la fuente que respalda cada respuesta
INSERT INTO preguntas_frecuentes (pregunta, respuesta, categoria, documento_id) VALUES
  ('¿Cuándo empiezan las clases del primer cuatrimestre de 2026?',
   'El 30 de marzo de 2026. El cuatrimestre dura 16 semanas y termina el 31 de julio.',
   'Calendario', (SELECT id FROM documentos WHERE numero = '2394/2025')),
  ('¿Cuántos turnos de exámenes finales hay en el año?',
   'El calendario 2026 tiene 10 turnos de exámenes finales, y cada turno tiene tres llamados: Mesa I, Mesa II y Mesa III.',
   'Mesas de examen', (SELECT id FROM documentos WHERE numero = '2394/2025')),
  ('¿Hasta cuándo me puedo inscribir a una mesa de examen?',
   'Cada llamado tiene su fecha de cierre de inscripción, unos días antes del examen. Por ejemplo, la Mesa I del 4° turno es el 9 de septiembre y la inscripción cierra el 7 de septiembre.',
   'Mesas de examen', (SELECT id FROM documentos WHERE numero = '2394/2025')),
  ('¿Qué necesito para inscribirme al seminario de ingreso?',
   'La constancia de finalización del secundario o la constancia de cursado del último año, en PDF. El resto de la documentación se presenta en marzo de 2027 en el departamento alumnos.',
   'Ingreso', (SELECT id FROM documentos WHERE titulo = 'Seminario de Ingreso Universitario 2027')),
  ('¿Qué materias tiene el primer nivel de Ingeniería en Sistemas de Información?',
   'Análisis Matemático I, Álgebra y Geometría Analítica, Física I, Ingeniería y Sociedad, Lógica y Estructuras Discretas, Algoritmos y Estructuras de Datos, Arquitectura de Computadoras y Sistemas y Procesos de Negocios.',
   'Plan de estudio', (SELECT id FROM documentos WHERE tipo = 'PLAN_DE_ESTUDIO')),
  ('¿Dónde queda la facultad?',
   'La sede central está en Rivadavia 1050, San Miguel de Tucumán, y hay una extensión áulica en Concepción (América y Ricardo Alfonsín).',
   'Institucional', NULL);

-- Conversaciones de ejemplo (ids 1 a 8, en el orden en que se insertan)
INSERT INTO conversaciones (canal, estado, iniciada_en) VALUES
  ('WEB', 'CERRADA', '2026-11-09 10:12-03'),
  ('WEB', 'CERRADA', '2026-11-09 18:40-03'),
  ('WHATSAPP', 'CERRADA', '2026-11-10 09:05-03'),
  ('WEB', 'ABIERTA', '2026-11-10 21:30-03'),
  ('WHATSAPP', 'ABIERTA', '2026-11-11 08:47-03'),
  ('WEB', 'ABIERTA', '2026-11-11 15:20-03'),
  ('WHATSAPP', 'ABIERTA', '2026-11-12 11:02-03'),
  ('WEB', 'ABIERTA', '2026-11-12 19:55-03');

-- Mensajes de ejemplo: la consulta del estudiante y la respuesta del asistente
INSERT INTO mensajes (conversacion_id, rol, texto, documento_id, enviado_en) VALUES
  (1, 'ESTUDIANTE', '¿Cuándo empiezan las clases?', NULL, '2026-11-09 10:12-03'),
  (1, 'ASISTENTE', 'El 1° cuatrimestre de 2026 empezó el 30 de marzo y el 2° cuatrimestre el 18 de agosto.',
   (SELECT id FROM documentos WHERE numero = '2394/2025'), '2026-11-09 10:12-03'),
  (2, 'ESTUDIANTE', '¿Qué necesito para anotarme al ingreso?', NULL, '2026-11-09 18:40-03'),
  (2, 'ASISTENTE', 'La constancia de finalización del secundario o de cursado del último año, en PDF.',
   (SELECT id FROM documentos WHERE titulo = 'Seminario de Ingreso Universitario 2027'), '2026-11-09 18:41-03'),
  (3, 'ESTUDIANTE', '¿Puedo rendir Análisis Matemático II si no aprobé Análisis I?', NULL, '2026-11-10 09:05-03'),
  (3, 'ASISTENTE', 'No: para rendir Análisis Matemático II necesitás tener aprobadas Análisis Matemático I y Álgebra y Geometría Analítica.',
   (SELECT id FROM documentos WHERE tipo = 'PLAN_DE_ESTUDIO'), '2026-11-10 09:05-03'),
  (4, 'ESTUDIANTE', 'Necesito un certificado de alumno regular, ¿cómo lo pido?', NULL, '2026-11-10 21:30-03'),
  (4, 'ASISTENTE', 'No tengo información oficial sobre ese trámite. Derivé tu consulta al personal de la facultad.', NULL, '2026-11-10 21:30-03'),
  (5, 'ESTUDIANTE', '¿Cuánto cuesta el seminario de ingreso?', NULL, '2026-11-11 08:47-03'),
  (5, 'ASISTENTE', 'No tengo información oficial sobre el costo. Derivé tu consulta al personal de la facultad.', NULL, '2026-11-11 08:47-03'),
  (6, 'ESTUDIANTE', '¿Me puedo anotar fuera de término a una materia del 2° cuatrimestre?', NULL, '2026-11-11 15:20-03'),
  (6, 'ASISTENTE', 'El plazo para pedir la inscripción fuera de término del 2° cuatrimestre fue del 18 al 21 de agosto. Derivé tu consulta para que el personal revise tu caso.',
   (SELECT id FROM documentos WHERE numero = '2394/2025'), '2026-11-11 15:21-03'),
  (7, 'ESTUDIANTE', '¿Cuándo publican las notas del último parcial de Física I?', NULL, '2026-11-12 11:02-03'),
  (7, 'ASISTENTE', 'No tengo esa información. Derivé tu consulta al personal de la facultad.', NULL, '2026-11-12 11:02-03'),
  (8, 'ESTUDIANTE', '¿La biblioteca abre los sábados?', NULL, '2026-11-12 19:55-03'),
  (8, 'ASISTENTE', 'No tengo información oficial sobre el horario de la biblioteca. Derivé tu consulta al personal de la facultad.', NULL, '2026-11-12 19:55-03');

-- Derivaciones de ejemplo de las consultas que el asistente no pudo responder
INSERT INTO derivaciones (conversacion_id, motivo, prioridad, estado, respuesta, creada_en, resuelta_en) VALUES
  (4, 'Sin información oficial sobre el certificado de alumno regular', 'MEDIA', 'RESUELTA',
   'El personal respondió la consulta por correo electrónico.', '2026-11-10 21:30-03', '2026-11-11 10:15-03'),
  (5, 'Sin información oficial sobre el costo del seminario de ingreso', 'ALTA', 'PENDIENTE',
   NULL, '2026-11-11 08:47-03', NULL),
  (6, 'Pedido de inscripción fuera de término con el plazo vencido', 'MEDIA', 'EN_CURSO',
   NULL, '2026-11-11 15:21-03', NULL),
  (7, 'Consulta sobre publicación de notas de un parcial', 'BAJA', 'PENDIENTE',
   NULL, '2026-11-12 11:02-03', NULL),
  (8, 'Sin información oficial sobre el horario de la biblioteca', 'BAJA', 'PENDIENTE',
   NULL, '2026-11-12 19:55-03', NULL);

COMMIT;
