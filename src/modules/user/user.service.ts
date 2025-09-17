import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { GetUserListDto } from './dtos/get-user-list.dto';
import {
  getSkipValue,
  getTotalPage,
} from 'src/utils/helpers/pagination.helper';
import { Prisma, Role } from '@prisma/client';
import { UpdateUserProfileDto } from './dtos/update-user-profile.dto';

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

  async getUserList(req: GetUserListDto) {
    const { page, take, position, search } = req;

    const where: Prisma.UserWhereInput = {};

    if (position) {
      where.position = position;
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

  async getUserProfile(id: number) {
    return await this.prismaService.user.findUnique({
      where: {
        id,
      },
      omit: {
        password: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUser(id: number) {
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
      throw new NotFoundException(`User with id ${id} is not found.`);
    }

    return user;
  }

  async updateUserProfile(id: number, req: UpdateUserProfileDto) {
    const { firstName, lastName, phoneNumber, position } = req;

    const userData = {
      firstName,
      lastName,
      phoneNumber,
      position,
    };

    return await this.prismaService.user.update({
      where: {
        id,
      },
      data: userData,
      omit: {
        username: true,
        password: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUser(id: number, req: UpdateUserDto) {
    const { firstName, lastName, phoneNumber, position, role } = req;

    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        username: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} is not found.`);
    }

    const userData = {
      firstName,
      lastName,
      phoneNumber,
      position,
      role,
    };

    return await this.prismaService.user.update({
      where: {
        id,
      },
      data: userData,
      omit: {
        username: true,
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
      throw new NotFoundException(`User with id ${id} is not found.`);
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
        role: true,
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
      throw new NotFoundException(`User with id ${id} is not found.`);
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
        role: true,
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
}
