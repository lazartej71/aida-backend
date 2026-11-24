-- Ampliación aditiva del backend: conserva los datos existentes.
BEGIN;
SET LOCAL search_path=public;
-- AlterTable
ALTER TABLE "conversaciones" ADD COLUMN     "acceso_hash" VARCHAR(64);

-- AlterTable
ALTER TABLE "documentos" ADD COLUMN     "version_actual" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "mensajes" ADD COLUMN     "fuentes" JSONB;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "rol" VARCHAR(12) NOT NULL DEFAULT 'ESTUDIANTE',
ADD COLUMN     "token_version" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "versiones_documento" (
    "id" SERIAL NOT NULL,
    "documento_id" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "versiones_documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fragmentos_documento" (
    "id" SERIAL NOT NULL,
    "version_id" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,

    CONSTRAINT "fragmentos_documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultas_asistente" (
    "id" SERIAL NOT NULL,
    "conversacion_id" INTEGER NOT NULL,
    "consulta" VARCHAR(2000) NOT NULL,
    "estrategia" VARCHAR(30) NOT NULL,
    "proveedor" VARCHAR(30) NOT NULL,
    "duracion_ms" INTEGER NOT NULL,
    "cantidad_fuentes" INTEGER NOT NULL,
    "tokens_entrada" INTEGER,
    "tokens_salida" INTEGER,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultas_asistente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_canal" (
    "id" VARCHAR(200) NOT NULL,
    "remitente_hash" VARCHAR(64) NOT NULL,
    "conversacion_id" INTEGER,
    "respuesta" TEXT,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'RECIBIDO',
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_canal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "versiones_documento_documento_id_numero_key" ON "versiones_documento"("documento_id", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "fragmentos_documento_version_id_orden_key" ON "fragmentos_documento"("version_id", "orden");

-- CreateIndex
CREATE INDEX "consultas_asistente_creado_en_idx" ON "consultas_asistente"("creado_en");

-- CreateIndex
CREATE INDEX "consultas_asistente_estrategia_idx" ON "consultas_asistente"("estrategia");

-- CreateIndex
CREATE INDEX "eventos_canal_remitente_hash_idx" ON "eventos_canal"("remitente_hash");

-- AddForeignKey
ALTER TABLE "versiones_documento" ADD CONSTRAINT "versiones_documento_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documentos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "fragmentos_documento" ADD CONSTRAINT "fragmentos_documento_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "versiones_documento"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "consultas_asistente" ADD CONSTRAINT "consultas_asistente_conversacion_id_fkey" FOREIGN KEY ("conversacion_id") REFERENCES "conversaciones"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "eventos_canal" ADD CONSTRAINT "eventos_canal_conversacion_id_fkey" FOREIGN KEY ("conversacion_id") REFERENCES "conversaciones"("id") ON DELETE SET NULL ON UPDATE NO ACTION;


ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_valido CHECK (rol IN ('ESTUDIANTE','PERSONAL','ADMIN'));
ALTER TABLE usuarios ADD CONSTRAINT usuarios_token_version_valida CHECK (token_version>=0);
ALTER TABLE documentos ADD CONSTRAINT documentos_version_valida CHECK (version_actual>=0);
ALTER TABLE consultas_asistente ADD CONSTRAINT consultas_duracion_valida CHECK (duracion_ms>=0 AND cantidad_fuentes>=0);
ALTER TABLE consultas_asistente ADD CONSTRAINT consultas_estrategia_valida CHECK (estrategia IN ('DATOS_EXACTOS','RECUPERACION_DOCUMENTAL','ABSTENCION'));
ALTER TABLE eventos_canal ADD CONSTRAINT eventos_canal_estado_valido CHECK (estado IN ('RECIBIDO','PROCESANDO','LISTO','ENVIADO','ERROR_ENVIO'));
CREATE INDEX fragmentos_busqueda_idx ON fragmentos_documento USING gin (to_tsvector('spanish',contenido));
ALTER TABLE versiones_documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE fragmentos_documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultas_asistente ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_canal ENABLE ROW LEVEL SECURITY;

COMMIT;
