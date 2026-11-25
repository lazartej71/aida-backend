import 'dotenv/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { obtenerJwtSecret } from './auth.config.js';
import { APP_GUARD } from '@nestjs/core';
import { LimitePedidosGuard } from './guards/limite-pedidos.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';

// Módulo de autenticación. Además del login y el registro, registra tres guards
// globales (APP_GUARD) que Nest ejecuta en este orden en cada petición:
// 1. LimitePedidosGuard: frena demasiados POST seguidos (429).
// 2. JwtAuthGuard: exige un token válido salvo en las rutas @Publico() (401).
// 3. RolesGuard: controla los roles de @Roles(...) (403).
@Module({
  imports: [
    UsuariosModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: obtenerJwtSecret(),
        signOptions: { expiresIn: '1h', algorithm: 'HS256' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: APP_GUARD, useClass: LimitePedidosGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
