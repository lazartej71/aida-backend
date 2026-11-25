import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterAuthDto } from './dto/register-auth.dto.js';
import { LoginAuthDto } from './dto/login-auth.dto.js';
import { Publico } from './decorators/publico.decorator.js';
import type { PeticionAutenticada } from './interfaces/peticion-autenticada.interface.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { CambiarPasswordDto, PerfilDto } from './dto/perfil.dto.js';
import { hashPassword, verifyPassword } from './password.util.js';
import { PrismaService } from '../prisma/prisma.service.js';

// Rutas de autenticación (/auth). Las rutas sin @Publico() necesitan el token:
// JwtAuthGuard lo valida y deja al usuario en req.usuario
@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly usuarios: UsuariosService,
    private readonly prisma: PrismaService,
  ) {}

  // POST /auth/register: crea una cuenta con rol ESTUDIANTE. Es pública.
  // @Body valida el cuerpo con RegisterAuthDto antes de llegar acá
  @Post('register')
  @ApiOperation({ security: [] })
  @Publico()
  register(@Body() dto: RegisterAuthDto) {
    return this.auth.register(dto);
  }

  // POST /auth/login: si el correo y la contraseña son correctos, devuelve el token JWT.
  // @HttpCode(200) porque Nest responde 201 en los POST, y el login no crea nada
  @Post('login')
  @ApiOperation({ security: [] })
  @Publico()
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginAuthDto) {
    return this.auth.login(dto);
  }

  // GET /auth/me: perfil del usuario que inició sesión. @Req da acceso a req.usuario
  @Get('me')
  perfil(@Req() req: PeticionAutenticada) {
    return this.usuarios.findOne(req.usuario.id);
  }

  // PATCH /auth/me: el usuario cambia su nombre o su email
  @Patch('me')
  actualizarPerfil(@Req() req: PeticionAutenticada, @Body() dto: PerfilDto) {
    return this.usuarios.update(req.usuario.id, dto);
  }

  // POST /auth/logout: sube tokenVersion, así todos los tokens anteriores dejan de valer
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: PeticionAutenticada) {
    await this.prisma.usuario.update({
      where: { id: req.usuario.id },
      data: { tokenVersion: { increment: 1 } },
    });
    return { mensaje: 'Se cerraron las sesiones activas.' };
  }

  // POST /auth/password: cambia la contraseña después de verificar la actual
  @Post('password')
  @HttpCode(200)
  async password(
    @Req() req: PeticionAutenticada,
    @Body() dto: CambiarPasswordDto,
  ) {
    const user = await this.usuarios.buscarPorEmail(req.usuario.email);
    if (!user || !(await verifyPassword(dto.passwordActual, user.passwordHash)))
      throw new UnauthorizedException('La contraseña actual es incorrecta.');
    await this.prisma.usuario.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(dto.passwordNueva),
        tokenVersion: { increment: 1 },
      },
    });
    return { mensaje: 'Contraseña actualizada. Iniciá sesión nuevamente.' };
  }
}
