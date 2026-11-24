import { HttpIaProvider } from './http.provider.js';
describe('adaptador HTTP de selección de evidencia', () => {
  const evidencia = {
    id: 'faq:1',
    titulo: 'Fuente',
    texto: 'Texto respaldado',
  };
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
  beforeEach(() => {
    vi.stubEnv('IA_ENDPOINT', 'https://example.invalid/seleccionar');
    vi.stubEnv('IA_API_KEY', 'clave-solo-de-prueba');
  });
  it('rechaza identificadores inventados por el proveedor', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ evidenciaId: 'inexistente' })),
        ),
    );
    expect(
      await new HttpIaProvider().seleccionar('consulta', [evidencia]),
    ).toBeNull();
  });
  it('admite solo una evidencia realmente suministrada', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ evidenciaId: 'faq:1' })),
        ),
    );
    expect(
      await new HttpIaProvider().seleccionar('consulta', [evidencia]),
    ).toBe('faq:1');
  });
  it('permite el respaldo local ante una caída del proveedor', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('sin conexión')),
    );
    expect(
      await new HttpIaProvider().seleccionar('consulta', [evidencia]),
    ).toBeNull();
  });
  it('no envía información a endpoints sin HTTPS', async () => {
    vi.stubEnv('IA_ENDPOINT', 'http://example.invalid');
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    expect(
      await new HttpIaProvider().seleccionar('consulta', [evidencia]),
    ).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});
