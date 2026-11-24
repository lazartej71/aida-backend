import { convertirFechas, operacion, validarRangos } from './operaciones.js';
describe('integridad de operaciones', () => {
  it.each(['2035-02-30', 'no-es-fecha', '2035-01-01T12:00:00Z'])(
    'rechaza la fecha de calendario inválida %s',
    (fecha) => {
      expect(() => convertirFechas({ fecha }, ['fecha'])).toThrow();
    },
  );
  it('admite una fecha bisiesta real y conserva los null opcionales', () => {
    const res = convertirFechas({ desde: '2032-02-29', hasta: null }, [
      'desde',
      'hasta',
    ]);
    expect(res.desde.toISOString()).toBe('2032-02-29T00:00:00.000Z');
    expect(res.hasta).toBeNull();
  });
  it('rechaza rangos inconsistentes y cierres el mismo día del examen', () => {
    expect(() =>
      validarRangos(
        { desde: new Date('2035-01-02'), hasta: new Date('2035-01-01') },
        [['desde', 'hasta']],
      ),
    ).toThrow();
    expect(() =>
      validarRangos(
        { desde: new Date('2035-01-01'), hasta: new Date('2035-01-01') },
        [['desde', 'hasta', true]],
      ),
    ).toThrow();
  });
  it.each([
    ['P2002', 409],
    ['P2003', 409],
    ['P2025', 404],
    ['P2004', 400],
    ['P2034', 503],
  ])('traduce %s al estado %s', async (code, status) => {
    await expect(
      operacion(() => Promise.reject({ code, datosPrivados: 'no exponer' })),
    ).rejects.toMatchObject({ status });
  });
});
