import { ValidationPipe } from '@nestjs/common';

// Valida el cuerpo de cada solicitud con las reglas de su DTO antes de llegar al controlador.
// whitelist descarta los campos que el DTO no declara y forbidNonWhitelisted
// responde con un error si llegan, para que no pasen datos inesperados.
// La usan main.ts y los tests e2e, así los dos validan igual
export function crearValidacion() {
  return new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
}
