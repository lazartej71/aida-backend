-- El asistente suma la estrategia CONVERSACION: responde saludos, agradecimientos
-- y pedidos de ayuda sin derivar la consulta al personal.
ALTER TABLE consultas_asistente DROP CONSTRAINT consultas_estrategia_valida;
ALTER TABLE consultas_asistente ADD CONSTRAINT consultas_estrategia_valida
  CHECK (estrategia IN ('CONVERSACION','DATOS_EXACTOS','RECUPERACION_DOCUMENTAL','ABSTENCION'));
