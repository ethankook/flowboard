import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(identifier: string, password: string) {
    const user = await this.usersService.findByUsernameOrEmail(identifier);
    if (!user) {
      return null;
    }
    const hash = user.passwordHash;
    if (await bcrypt.compare(password, hash)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_TOKEN_EXPIRES'),
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hashedRefreshToken },
    });
  }

  async login(user: { id: string; email: string }) {
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
    );
    await this.storeRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  async refreshTokens(userId: string, incomingRefreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!(await bcrypt.compare(incomingRefreshToken, user.refreshTokenHash))) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { accessToken, refreshToken } = await this.generateTokens(
      userId,
      user.email,
    );

    await this.storeRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }
}
