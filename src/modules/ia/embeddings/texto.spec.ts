import {
  formatearFecha,
  mesMencionado,
  raiz,
  similitud,
  terminos,
} from './texto.js';

describe('Herramientas de texto del asistente', () => {
  it('quita el plural de las palabras', () => {
    expect(raiz('inscripciones')).toBe('inscripcion');
    expect(raiz('examenes')).toBe('examen');
    expect(raiz('mesas')).toBe('mesa');
    expect(raiz('tramites')).toBe('tramite');
  });

  it('unifica sinónimos y descarta palabras vacías', () => {
    expect(terminos('¿Cuándo me puedo inscribir a los finales?')).toEqual([
      'inscripcion',
      'examen',
    ]);
  });

  it('compara textos sin importar plurales ni tildes', () => {
    expect(similitud('trámites', 'Trámite de cambio de plan')).toBe(1);
  });

  it('reconoce el mes nombrado en la consulta', () => {
    expect(mesMencionado('mesas de diciembre')).toBe(11);
    expect(mesMencionado('mesas de setiembre')).toBe(8);
    expect(mesMencionado('próximas mesas')).toBeNull();
  });

  it('muestra las fechas en formato argentino sin correrse un día', () => {
    expect(formatearFecha(new Date('2026-12-14T00:00:00Z'))).toBe('14/12/2026');
  });
});
