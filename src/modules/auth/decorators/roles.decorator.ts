import { SetMetadata } from '@nestjs/common';

export const ROLES = 'aida:roles';

// @Roles('PERSONAL', 'ADMIN') indica qué roles pueden usar una ruta o un controlador
// entero. Igual que @Publico, guarda la lista como metadata y RolesGuard la compara
// con el rol del usuario que inició sesión
export const Roles = (...roles: string[]) => SetMetadata(ROLES, roles);
