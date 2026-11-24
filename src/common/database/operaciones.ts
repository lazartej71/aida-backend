import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

export async function operacion<T>(ejecutar: () => Promise<T>): Promise<T> {
  try {
    return await ejecutar();
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String(error.code)
        : '';
    if (code === 'P2025') throw new NotFoundException('El registro no existe.');
    if (code === 'P2002')
      throw new ConflictException(
        'Ya existe un registro con esos datos únicos.',
      );
    if (code === 'P2003')
      throw new ConflictException(
        'La relación no existe o hay registros relacionados que impiden esta operación.',
      );
    if (['P2000', 'P2004', 'P2011', 'P2020'].includes(code))
      throw new BadRequestException(
        'Los datos no cumplen las restricciones de la base.',
      );
    if (['P1001', 'P1002', 'P1017', 'P2024', 'P2034'].includes(code))
      throw new ServiceUnavailableException(
        'No se pudo completar la operación. Intentá nuevamente.',
      );
    throw error;
  }
}

export function convertirFechas<T extends object, K extends keyof T>(
  dto: T,
  campos: readonly K[],
): { [P in keyof T]: P extends K ? Date | Exclude<T[P], string> : T[P] } {
  const datos = limpiarDatos(dto) as Record<string, unknown>;
  for (const campo of campos) {
    const valor = datos[String(campo)];
    if (valor === undefined || valor === null) continue;
    if (
      typeof valor !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(valor) ||
      !Number.isFinite(Date.parse(valor)) ||
      new Date(valor).toISOString().slice(0, 10) !== valor
    ) {
      throw new BadRequestException(
        `${String(campo)} debe ser una fecha válida con formato AAAA-MM-DD.`,
      );
    }
    datos[String(campo)] = new Date(`${valor}T00:00:00.000Z`);
  }
  return datos as ReturnType<typeof convertirFechas<T, K>>;
}

export function limpiarDatos<T extends object>(dto: T): T {
  const datos = { ...dto } as Record<string, unknown>;
  for (const [campo, valor] of Object.entries(datos)) {
    if (typeof valor !== 'string') continue;
    datos[campo] = valor.trim();
    if (
      ['nombre', 'titulo', 'descripcion', 'pregunta', 'respuesta'].includes(
        campo,
      ) &&
      !valor.trim()
    )
      throw new BadRequestException(`${campo} no puede estar vacío.`);
  }
  return datos as T;
}

export function validarRangos(
  datos: object,
  pares: readonly (readonly [string, string, boolean?])[],
) {
  const valores = datos as Record<string, unknown>;
  for (const [desde, hasta, estricto] of pares) {
    const inicio = valores[desde];
    const fin = valores[hasta];
    if (
      inicio instanceof Date &&
      fin instanceof Date &&
      (estricto ? fin <= inicio : fin < inicio)
    ) {
      throw new BadRequestException(
        `${hasta} debe ser ${estricto ? 'posterior' : 'igual o posterior'} a ${desde}.`,
      );
    }
  }
}
