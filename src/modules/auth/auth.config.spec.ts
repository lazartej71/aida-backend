import { obtenerJwtSecret } from './auth.config.js';

describe('JWT_SECRET', () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each([undefined, '', 'corto', ' '.repeat(40)])(
    'rechaza un secreto ausente o débil: %s',
    (secret) => {
      vi.stubEnv('JWT_SECRET', secret);
      expect(() => obtenerJwtSecret()).toThrow('JWT_SECRET');
    },
  );

  it('lee el secreto privado sin un valor por defecto', () => {
    const secret = 'secreto-local-de-prueba-de-32-bytes-minimo';
    vi.stubEnv('JWT_SECRET', secret);
    expect(obtenerJwtSecret()).toBe(secret);
  });
});
