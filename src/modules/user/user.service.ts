import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { GetListUserDto } from './dtos/get-list-user.dto';
import {
  getSkipValue,
  getTotalPage,
} from 'src/utils/helpers/pagination.helper';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class UserService {
  private saltRound: number;
  private adminPassword: string;
  private userPassword: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.saltRound = Number(this.config.getOrThrow<string>('SALT_ROUND'));
    this.adminPassword = this.config.getOrThrow<string>(
      'DEFAULT_ADMIN_PASSWORD',
    );
    this.userPassword = this.config.getOrThrow<string>('DEFAULT_USER_PASSWORD');
  }

  // Get list user service
  async getListUser(req: GetListUserDto) {
    const { page, take, role, search } = req;

    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        {
          username: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          firstName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          phoneNumber: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const skip = getSkipValue(page, take);
    const result = await this.prismaService.user.findMany({
      where,
      skip,
      take,
      orderBy: {
        id: 'desc',
      },
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalItems = await this.prismaService.user.count({
      where,
    });

    const totalPage = getTotalPage(totalItems, take);

    return {
      result,
      page,
      take,
      totalItems,
      totalPage,
    };
  }

  async getUserById(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" is not found.`);
    }

    return user;
  }

  async createUser(req: CreateUserDto) {
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

    const userData = {
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

  async updateUser(id: number, req: UpdateUserDto) {
    const { username, firstName, lastName, phoneNumber, role } = req;

    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        username: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" is not found.`);
    }

    if (user.username !== username) {
      const usernameExists = await this.prismaService.user.findUnique({
        where: {
          username,
        },
        select: {
          username: true,
        },
      });

      if (usernameExists) {
        throw new BadRequestException('Username is already exists.');
      }
    }

    const userData = {
      username,
      firstName,
      lastName,
      phoneNumber,
      role,
    };

    return await this.prismaService.user.update({
      where: {
        id,
      },
      data: userData,
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id} "is not found.`);
    }

    return await this.prismaService.user.delete({
      where: {
        id,
      },
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async resetPassword(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" is not found.`);
    }

    let defaultPassword: string;

    if (user.role === Role.ADMIN) {
      defaultPassword = this.adminPassword;
    } else {
      defaultPassword = this.userPassword;
    }

    const hashPassword = await bcrypt.hash(defaultPassword, this.saltRound);

    return await this.prismaService.user.update({
      where: { id },
      data: { password: hashPassword },
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async changePassword(id: number, req: ChangePasswordDto) {
    const { oldPassword, newPassword } = req;

    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: { password: true },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" is not found.`);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect.');
    }

    if (oldPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from the old password.',
      );
    }

    const hashNewPassword = await bcrypt.hash(newPassword, this.saltRound);

    return await this.prismaService.user.update({
      where: { id },
      data: {
        password: hashNewPassword,
      },
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
