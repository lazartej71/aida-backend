import { createHmac } from 'node:crypto';
import { CanalesService } from './canales.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { ChatService } from '../chat/chat.service.js';
describe('webhook de WhatsApp', () => {
  const secreto = 'secreto-local-para-hmac';
  const prisma = { eventoCanal: { findUnique: vi.fn() } };
  const chat = { create: vi.fn(), agregarInterno: vi.fn() };
  const service = () =>
    new CanalesService(
      prisma as unknown as PrismaService,
      chat as unknown as ChatService,
    );
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('WHATSAPP_APP_SECRET', secreto);
    vi.stubEnv('WHATSAPP_VERIFY_TOKEN', 'verificacion-prueba');
    vi.stubEnv('WHATSAPP_ACCESS_TOKEN', 'token-de-prueba');
    vi.stubEnv('WHATSAPP_PHONE_NUMBER_ID', '123456');
    vi.stubEnv('WHATSAPP_GRAPH_VERSION', 'v99.0');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
  it('no simula disponibilidad sin credenciales', () => {
    vi.stubEnv('WHATSAPP_ACCESS_TOKEN', '');
    expect(() =>
      service().verificar('subscribe', 'verificacion-prueba', '123'),
    ).toThrow('no está configurado');
  });
  it('verifica el token de suscripción', () => {
    expect(service().verificar('subscribe', 'verificacion-prueba', '123')).toBe(
      '123',
    );
    expect(() => service().verificar('subscribe', 'otro', '123')).toThrow();
  });
  it('rechaza notificaciones con firma falsa antes de procesar datos', async () => {
    await expect(
      service().recibir(Buffer.from('{}'), `sha256=${'0'.repeat(64)}`),
    ).rejects.toMatchObject({ status: 403 });
    expect(chat.create).not.toHaveBeenCalled();
  });
  it('acepta una notificación firmada sin mensajes y no envía nada', async () => {
    const raw = Buffer.from(
      JSON.stringify({
        entry: [
          {
            changes: [
              {
                value: {
                  metadata: { phone_number_id: '123456' },
                  statuses: [],
                },
              },
            ],
          },
        ],
      }),
    );
    const firma = `sha256=${createHmac('sha256', secreto).update(raw).digest('hex')}`;
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await expect(service().recibir(raw, firma)).resolves.toEqual({
      recibido: true,
    });
    expect(fetch).not.toHaveBeenCalled();
  });
  it('no reprocesa un evento ya enviado', async () => {
    prisma.eventoCanal.findUnique.mockResolvedValue({ estado: 'ENVIADO' });
    const raw = Buffer.from(
      JSON.stringify({
        entry: [
          {
            changes: [
              {
                value: {
                  metadata: { phone_number_id: '123456' },
                  messages: [
                    {
                      id: 'wamid-prueba',
                      from: '5493811234567',
                      type: 'text',
                      text: { body: 'Hola' },
                    },
                  ],
                },
              },
            ],
          },
        ],
      }),
    );
    const firma = `sha256=${createHmac('sha256', secreto).update(raw).digest('hex')}`;
    await service().recibir(raw, firma);
    expect(chat.create).not.toHaveBeenCalled();
    expect(chat.agregarInterno).not.toHaveBeenCalled();
  });
});
