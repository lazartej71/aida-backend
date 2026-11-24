import { SetMetadata } from '@nestjs/common';
export const PUBLICO = 'aida:publico';
export const ROLES = 'aida:roles';
export const Publico = () => SetMetadata(PUBLICO, true);
export const Roles = (...roles: string[]) => SetMetadata(ROLES, roles);
