import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto } from './dtos/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dtos/register.dto';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  private saltRound: number;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.saltRound = Number(this.config.getOrThrow<string>('SALT_ROUND'));
  }

  async login(req: LoginDto) {
    const { username, password } = req;

    const user = await this.prismaService.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Username is not found.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Password is incorrect.');
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      ...payload,
    };
  }

  async register(req: RegisterDto) {
    const { username, password, firstName, lastName, phoneNumber, role } = req;

    const user = await this.prismaService.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });

    if (user) {
      throw new BadRequestException('Username is already exists.');
    }

    const hashPassword = await bcrypt.hash(password, this.saltRound);

    const userData: Prisma.UserCreateInput = {
      username,
      password: hashPassword,
      firstName,
      lastName,
      phoneNumber,
      role,
    };

    return await this.prismaService.user.create({
      data: userData,
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
