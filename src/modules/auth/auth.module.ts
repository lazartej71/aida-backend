import 'dotenv/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { obtenerJwtSecret } from './auth.config.js';
import { APP_GUARD } from '@nestjs/core';
import { AccesoGuard } from './acceso.guard.js';

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
    AccesoGuard,
    { provide: APP_GUARD, useExisting: AccesoGuard },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
