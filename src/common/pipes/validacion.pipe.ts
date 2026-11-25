import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from '@nestjs/common';

// Junta los mensajes de error de cada campo (y de los objetos anidados, si hay).
// El error de un campo no declarado viene en inglés desde la librería: se traduce
function mensajes(errores: ValidationError[]): string[] {
  return errores.flatMap((error) => [
    ...Object.entries(error.constraints ?? {}).map(([regla, mensaje]) =>
      regla === 'whitelistValidation'
        ? `El campo "${error.property}" no está permitido.`
        : mensaje,
    ),
    ...mensajes(error.children ?? []),
  ]);
}

// Valida cada solicitud con las reglas de su DTO antes de llegar al controlador.
// - transform: convierte los datos a los tipos del DTO (por ejemplo, texto a número).
// - whitelist: descarta los campos que el DTO no declara.
// - forbidNonWhitelisted: en lugar de descartarlos en silencio, responde 400,
//   para que no pasen datos inesperados (por ejemplo, alguien que intente mandar "rol").
// Si algo no cumple, responde 400 con la lista de mensajes definidos en el DTO.
// La registra main.ts para toda la aplicación
export function crearValidacion() {
  return new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errores) => new BadRequestException(mensajes(errores)),
  });
}
