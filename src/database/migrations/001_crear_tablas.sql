-- AIda - Base de datos (PostgreSQL)
-- Crea las tablas del sistema con sus claves primarias, claves foráneas y restricciones.
-- Se puede ejecutar más de una vez: primero borra las tablas si ya existen.

DROP TABLE IF EXISTS derivaciones, mensajes, conversaciones, preguntas_frecuentes, tramites,
  info_ingreso, eventos_academicos, periodos_inscripcion, mesas_examen, correlatividades,
  materias, carreras, documentos CASCADE;

-- Documentos oficiales: resoluciones, ordenanzas y planes de estudio.
-- Otras tablas los referencian para citar la fuente de cada dato.
CREATE TABLE documentos (
  id             SERIAL       PRIMARY KEY,
  titulo         VARCHAR(200) NOT NULL,
  tipo           VARCHAR(20)  NOT NULL
                 CHECK (tipo IN ('RESOLUCION', 'ORDENANZA', 'PLAN_DE_ESTUDIO', 'OTRO')),
  numero         VARCHAR(30),
  url            TEXT,
  vigente_desde  DATE,
  vigente_hasta  DATE,
  creado_en      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT documentos_vigencia_valida
    CHECK (vigente_hasta IS NULL OR vigente_desde IS NULL OR vigente_hasta >= vigente_desde)
);

-- Carreras de grado (ingenierías) y de pregrado (tecnicaturas)
CREATE TABLE carreras (
  id              SERIAL       PRIMARY KEY,
  nombre          VARCHAR(120) NOT NULL UNIQUE,
  tipo            VARCHAR(10)  NOT NULL CHECK (tipo IN ('GRADO', 'PREGRADO')),
  duracion_anios  SMALLINT     CHECK (duracion_anios > 0),
  plan            VARCHAR(20),
  activa          BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Materias de cada carrera. Una carrera tiene muchas materias
CREATE TABLE materias (
  id          SERIAL       PRIMARY KEY,
  carrera_id  INTEGER      NOT NULL REFERENCES carreras (id) ON DELETE RESTRICT,
  codigo      SMALLINT     NOT NULL CHECK (codigo > 0),
  nombre      VARCHAR(120) NOT NULL,
  nivel       SMALLINT     NOT NULL CHECK (nivel BETWEEN 1 AND 6),
  es_electiva BOOLEAN      NOT NULL DEFAULT FALSE,
  creado_en   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT materias_codigo_unico UNIQUE (carrera_id, codigo),
  CONSTRAINT materias_nombre_unico UNIQUE (carrera_id, nombre)
);

-- Correlatividades: una materia requiere otra para cursarla o para rendirla.
-- Es una relación de muchos a muchos de la tabla materias consigo misma
CREATE TABLE correlatividades (
  materia_id   INTEGER     NOT NULL REFERENCES materias (id) ON DELETE CASCADE,
  requiere_id  INTEGER     NOT NULL REFERENCES materias (id) ON DELETE RESTRICT,
  para         VARCHAR(10) NOT NULL CHECK (para IN ('CURSAR', 'RENDIR')),
  condicion    VARCHAR(10) NOT NULL CHECK (condicion IN ('REGULAR', 'APROBADA')),
  PRIMARY KEY (materia_id, requiere_id, para),
  CONSTRAINT correlatividades_no_a_si_misma CHECK (materia_id <> requiere_id)
);

-- Mesas de examen: cada turno tiene tres llamados (Mesa I, II y III)
CREATE TABLE mesas_examen (
  id                  SERIAL      PRIMARY KEY,
  materia_id          INTEGER     NOT NULL REFERENCES materias (id) ON DELETE CASCADE,
  turno               SMALLINT    NOT NULL CHECK (turno BETWEEN 1 AND 10),
  llamado             VARCHAR(3)  NOT NULL CHECK (llamado IN ('I', 'II', 'III')),
  fecha               DATE        NOT NULL,
  cierre_inscripcion  DATE        NOT NULL,
  documento_id        INTEGER     REFERENCES documentos (id) ON DELETE SET NULL,
  CONSTRAINT mesas_examen_unica UNIQUE (materia_id, turno, llamado, fecha),
  CONSTRAINT mesas_examen_cierre_antes CHECK (cierre_inscripcion < fecha)
);

-- Períodos de inscripción al cursado (por nivel o para todos)
CREATE TABLE periodos_inscripcion (
  id            SERIAL       PRIMARY KEY,
  descripcion   VARCHAR(200) NOT NULL,
  tipo          VARCHAR(10)  NOT NULL CHECK (tipo IN ('CURSADO', 'EXAMEN')),
  nivel         SMALLINT     CHECK (nivel BETWEEN 1 AND 6),
  fecha_desde   DATE         NOT NULL,
  fecha_hasta   DATE         NOT NULL,
  documento_id  INTEGER      REFERENCES documentos (id) ON DELETE SET NULL,
  CONSTRAINT periodos_inscripcion_fechas CHECK (fecha_hasta >= fecha_desde)
);

-- Eventos del calendario académico: clases, recesos, pruebas de suficiencia, etc.
CREATE TABLE eventos_academicos (
  id            SERIAL       PRIMARY KEY,
  titulo        VARCHAR(200) NOT NULL,
  tipo          VARCHAR(15)  NOT NULL
                CHECK (tipo IN ('CLASES', 'RECESO', 'SUFICIENCIA', 'EXAMENES', 'OTRO')),
  fecha_desde   DATE         NOT NULL,
  fecha_hasta   DATE,
  documento_id  INTEGER      REFERENCES documentos (id) ON DELETE SET NULL,
  CONSTRAINT eventos_academicos_fechas CHECK (fecha_hasta IS NULL OR fecha_hasta >= fecha_desde)
);

-- Información para ingresantes: seminario y pruebas de suficiencia
CREATE TABLE info_ingreso (
  id                         SERIAL       PRIMARY KEY,
  titulo                     VARCHAR(200) NOT NULL,
  descripcion                TEXT         NOT NULL,
  modalidad                  VARCHAR(15)  CHECK (modalidad IN ('PRESENCIAL', 'LIBRE')),
  inscripcion_desde          DATE,
  inscripcion_hasta          DATE,
  CONSTRAINT info_ingreso_fechas
    CHECK (inscripcion_hasta IS NULL OR inscripcion_desde IS NULL OR inscripcion_hasta >= inscripcion_desde)
);

-- Trámites que pueden hacer los estudiantes y su plazo
CREATE TABLE tramites (
  id            SERIAL       PRIMARY KEY,
  nombre        VARCHAR(150) NOT NULL UNIQUE,
  descripcion   TEXT         NOT NULL,
  oficina       VARCHAR(100),
  plazo_desde   DATE,
  plazo_hasta   DATE,
  documento_id  INTEGER      REFERENCES documentos (id) ON DELETE SET NULL,
  CONSTRAINT tramites_plazo CHECK (plazo_hasta IS NULL OR plazo_desde IS NULL OR plazo_hasta >= plazo_desde)
);

-- Preguntas frecuentes con su respuesta oficial y el documento que la respalda
CREATE TABLE preguntas_frecuentes (
  id            SERIAL       PRIMARY KEY,
  pregunta      VARCHAR(300) NOT NULL UNIQUE,
  respuesta     TEXT         NOT NULL,
  categoria     VARCHAR(50)  NOT NULL,
  documento_id  INTEGER      REFERENCES documentos (id) ON DELETE SET NULL
);

-- Conversaciones de los estudiantes con el asistente (módulo chat)
CREATE TABLE conversaciones (
  id           SERIAL      PRIMARY KEY,
  canal        VARCHAR(10) NOT NULL CHECK (canal IN ('WEB', 'WHATSAPP')),
  estado       VARCHAR(10) NOT NULL DEFAULT 'ABIERTA' CHECK (estado IN ('ABIERTA', 'CERRADA')),
  iniciada_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mensajes de cada conversación. Una conversación tiene muchos mensajes
CREATE TABLE mensajes (
  id               SERIAL      PRIMARY KEY,
  conversacion_id  INTEGER     NOT NULL REFERENCES conversaciones (id) ON DELETE CASCADE,
  rol              VARCHAR(12) NOT NULL CHECK (rol IN ('ESTUDIANTE', 'ASISTENTE')),
  texto            TEXT        NOT NULL,
  documento_id     INTEGER     REFERENCES documentos (id) ON DELETE SET NULL,
  enviado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Derivaciones: consultas que el asistente no pudo responder con certeza
-- y pasan al personal de la facultad
CREATE TABLE derivaciones (
  id               SERIAL      PRIMARY KEY,
  conversacion_id  INTEGER     NOT NULL REFERENCES conversaciones (id) ON DELETE CASCADE,
  motivo           TEXT        NOT NULL,
  prioridad        VARCHAR(5)  NOT NULL DEFAULT 'MEDIA' CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA')),
  estado           VARCHAR(10) NOT NULL DEFAULT 'PENDIENTE'
                   CHECK (estado IN ('PENDIENTE', 'EN_CURSO', 'RESUELTA')),
  respuesta        TEXT,
  creada_en        TIMESTAMPTZ NOT NULL DEFAULT now(),
  resuelta_en      TIMESTAMPTZ,
  -- Una derivación resuelta tiene que tener respuesta y fecha de resolución
  CONSTRAINT derivaciones_resuelta_completa
    CHECK (estado <> 'RESUELTA' OR (respuesta IS NOT NULL AND resuelta_en IS NOT NULL))
);

-- Índices para las búsquedas más comunes por clave foránea
CREATE INDEX materias_carrera_idx ON materias (carrera_id);
CREATE INDEX mesas_examen_materia_idx ON mesas_examen (materia_id);
CREATE INDEX mensajes_conversacion_idx ON mensajes (conversacion_id);
CREATE INDEX derivaciones_conversacion_idx ON derivaciones (conversacion_id);
