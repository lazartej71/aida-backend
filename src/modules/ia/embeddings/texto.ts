// Herramientas de texto que usa el asistente para entender una consulta.
// No hay IA acá: son reglas simples y explicables, para que la búsqueda en la
// base sea predecible y siempre se pueda decir por qué respondió lo que respondió.

// Palabras que no aportan significado a la búsqueda ("que", "de", "la"...)
const palabrasVacias = new Set(
  'que como cuando donde cual cuales para por del las los una uno unos unas sobre tengo necesito saber quiero puedo con sin desde hasta esta este son hay me mi el la de en y o a al un se es'.split(
    ' ',
  ),
);

// Formas distintas de decir lo mismo. Se reemplazan por una palabra común,
// así "me inscribo", "anotarme" e "inscripciones" terminan en "inscripcion"
const sinonimos: Record<string, string> = {
  inscribo: 'inscripcion',
  inscribirme: 'inscripcion',
  inscribir: 'inscripcion',
  inscripto: 'inscripcion',
  anoto: 'inscripcion',
  anotarme: 'inscripcion',
  anotar: 'inscripcion',
  rendir: 'examen',
  rindo: 'examen',
  final: 'examen',
  cursada: 'cursado',
  cursar: 'cursado',
  vacacion: 'receso',
};

// Quita tildes, pasa a minúsculas y deja solo letras, números y espacios
export function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Lleva una palabra a una forma base quitando el plural:
// "inscripciones" → "inscripcion", "examenes" → "examen", "mesas" → "mesa"
export function raiz(palabra: string) {
  if (palabra.length > 5 && palabra.endsWith('iones'))
    return palabra.slice(0, -2);
  if (palabra.length > 4 && /[lnrdj]es$/.test(palabra))
    return palabra.slice(0, -2);
  if (palabra.length > 3 && palabra.endsWith('s') && !palabra.endsWith('ss'))
    return palabra.slice(0, -1);
  return palabra;
}

// Palabras importantes de un texto, sin repetir, en su forma base y con los sinónimos unificados
export function terminos(texto: string) {
  return [
    ...new Set(
      normalizar(texto)
        .split(' ')
        .filter((t) => t.length > 2 && !palabrasVacias.has(t))
        .map((t) => {
          const base = raiz(t);
          return sinonimos[base] ?? base;
        }),
    ),
  ];
}

// Qué parte de las palabras de la consulta aparece en el texto (de 0 a 1)
export function similitud(consulta: string, texto: string) {
  const entrada = terminos(consulta);
  const evidencia = new Set(terminos(texto));
  if (!entrada.length) return 0;
  return entrada.filter((t) => evidencia.has(t)).length / entrada.length;
}

const meses = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

// Si la consulta nombra un mes ("mesas de diciembre"), devuelve su número (0 a 11)
export function mesMencionado(texto: string): number | null {
  const palabras = normalizar(texto)
    .replace('setiembre', 'septiembre')
    .split(' ');
  const indice = meses.findIndex((mes) => palabras.includes(mes));
  return indice === -1 ? null : indice;
}

export function nombreDelMes(mes: number) {
  return meses[mes];
}

// Fecha en formato argentino (dd/mm/aaaa). Las fechas se guardan a las 00:00 UTC,
// por eso se leen en UTC: si no, en Argentina mostrarían el día anterior
export function formatearFecha(fecha: Date) {
  const dia = String(fecha.getUTCDate()).padStart(2, '0');
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${fecha.getUTCFullYear()}`;
}

// La fecha de hoy en Argentina, a las 00:00 UTC, para compararla con las fechas guardadas
export function hoyArgentina() {
  return new Date(
    `${new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())}T00:00:00Z`,
  );
}
