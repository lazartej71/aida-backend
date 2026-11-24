import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { RegisterAuthDto } from './dto/register-auth.dto.js';
import { LoginAuthDto } from './dto/login-auth.dto.js';
import { hashPassword, verifyPassword } from './password.util.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarios: UsuariosService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterAuthDto) {
    const passwordHash = await hashPassword(dto.password);
    try {
      return await this.usuarios.crearParaRegistro(
        dto.nombre,
        dto.email,
        passwordHash,
      );
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Ya existe una cuenta con ese correo electrónico.',
        );
      }
      throw error;
    }
  }

  async login(dto: LoginAuthDto) {
    const user = await this.usuarios.buscarPorEmail(dto.email);
    if (
      !user ||
      !user.activo ||
      !(await verifyPassword(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      version: user.tokenVersion,
    });
    return {
      access_token: accessToken,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        creadoEn: user.creadoEn,
        actualizadoEn: user.actualizadoEn,
      },
    };
  }
}
