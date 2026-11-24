-- TP12: agrega usuarios sin modificar las tablas y datos existentes.
BEGIN;
SET LOCAL search_path = public;

CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password_hash" VARCHAR(60) NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
ALTER TABLE "usuarios" ENABLE ROW LEVEL SECURITY;

COMMIT;
