import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { isEmail } from 'class-validator';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    if (await this.prisma.user.findUnique({ where: { email: dto.email } })) {
      throw new ConflictException('Email already exists');
    }

    if (
      await this.prisma.user.findUnique({ where: { username: dto.username } })
    ) {
      throw new ConflictException('Username already exists');
    }

    try {
      return await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: await bcrypt.hash(dto.password, 12),
          username: dto.username,
        },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email or username already exists');
      }

      throw error;
    }
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByUsernameOrEmail(identifier: string) {
    if (isEmail(identifier)) {
      return this.findByEmail(identifier);
    }
    return this.findByUsername(identifier);
  }
}
