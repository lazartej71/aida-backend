import { SetMetadata } from '@nestjs/common';

export const PUBLICO = 'aida:publico';

// @Publico() marca una ruta que no necesita sesión (por ejemplo, el login o
// listar las carreras). SetMetadata le pega a la ruta una "etiqueta" que después
// leen los guards con el Reflector: si la ruta es pública, no piden el token
export const Publico = () => SetMetadata(PUBLICO, true);
