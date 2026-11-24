const palabrasVacias = new Set(
  'que como cuando donde cual cuales para por del las los una uno unos unas sobre tengo necesito saber quiero puedo con sin desde hasta esta este son hay me mi el la de en y o a al un se es'.split(
    ' ',
  ),
);
export function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
export function terminos(texto: string) {
  return [
    ...new Set(
      normalizar(texto)
        .split(' ')
        .filter((t) => t.length > 2 && !palabrasVacias.has(t)),
    ),
  ];
}
export function similitud(consulta: string, texto: string) {
  const entrada = terminos(consulta);
  const evidencia = new Set(terminos(texto));
  if (!entrada.length) return 0;
  return entrada.filter((t) => evidencia.has(t)).length / entrada.length;
}
export function hoyArgentina() {
  return new Date(
    `${new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())}T00:00:00Z`,
  );
}
