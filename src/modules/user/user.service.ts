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
import { GetUsersDto } from './dtos/get-users.dto';
import {
  getSkipValue,
  getTotalPage,
} from 'src/utils/helpers/pagination.helper';
import { Prisma, Role } from '@prisma/client';
import { UpdateUserProfileDto } from './dtos/update-user-profile.dto';
import { GetUserClaimsDto } from './dtos/get-user-claims.dto';
import { join } from 'path';
import { getImageDirectory, safeUnlink } from 'src/utils/helpers/file.helper';

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

  async getUsers(req: GetUsersDto) {
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

  async getUserClaims(id: number, req: GetUserClaimsDto) {
    const { startDate, endDate, page, take, search, menuType } = req;

    const where: Prisma.ClaimWhereInput = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      User: {
        id,
      },
    };

    const and: Prisma.ClaimWhereInput[] = [];

    if (menuType) {
      and.push({
        Menu: { menuType },
      });
    }

    if (search) {
      and.push({
        Menu: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      });
    }

    if (and.length) {
      where.AND = and;
    }

    const skip = getSkipValue(page, take);

    const result = await this.prismaService.claim.findMany({
      where,
      skip,
      take,
      include: {
        Menu: {
          omit: {
            stock: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      omit: {
        updatedAt: true,
        userId: true,
        menuId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalItems = await this.prismaService.claim.count({
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

  async updateUserProfile(
    id: number,
    req: UpdateUserProfileDto,
    file?: Express.Multer.File,
  ) {
    const { firstName, lastName, phoneNumber, position } = req;
    const newImageName = file?.filename;

    const imageDir = getImageDirectory();
    let imagePath: string;

    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        imageName: true,
      },
    });

    if (!user) {
      if (newImageName) {
        imagePath = join(imageDir, newImageName);
        safeUnlink(imagePath);
      }

      throw new NotFoundException(`User with id ${id} is not found.`);
    }

    const userData: Prisma.UserUpdateInput = {
      firstName,
      lastName,
      phoneNumber,
      position,
      imageName: newImageName,
    };

    const updated = await this.prismaService.user.update({
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

    if (user.imageName && newImageName) {
      imagePath = join(imageDir, user.imageName);
      safeUnlink(imagePath);
    }

    return updated;
  }

  async updateUser(id: number, req: UpdateUserDto, file?: Express.Multer.File) {
    const { firstName, lastName, phoneNumber, position, role } = req;
    const newImageName = file?.filename;

    const imageDir = getImageDirectory();
    let imagePath: string;

    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        imageName: true,
      },
    });

    if (!user) {
      if (newImageName) {
        imagePath = join(imageDir, newImageName);
        safeUnlink(imagePath);
      }

      throw new NotFoundException(`User with id ${id} is not found.`);
    }

    const userData: Prisma.UserUpdateInput = {
      firstName,
      lastName,
      phoneNumber,
      position,
      role,
      imageName: newImageName,
    };

    const updated = await this.prismaService.user.update({
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

    if (user.imageName && newImageName) {
      imagePath = join(imageDir, user.imageName);
      safeUnlink(imagePath);
    }

    return updated;
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
        imageName: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id} "is not found.`);
    }

    const deleted = await this.prismaService.user.delete({
      where: {
        id,
      },
      omit: {
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (user.imageName) {
      const imagePath = join(getImageDirectory(), user.imageName);
      safeUnlink(imagePath);
    }

    return deleted;
  }
}
