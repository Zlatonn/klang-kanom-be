import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dtos/create-menu.dto';
import { GetMenuListDto } from './dtos/get-menu-list.dto';
import { Prisma } from '@prisma/client';
import {
  getSkipValue,
  getTotalPage,
} from 'src/utils/helpers/pagination.helper';
import { join } from 'path';
import { UpdateMenuDto } from './dtos/update-menu.dto';
import { getImageDirectory, safeUnlink } from 'src/utils/helpers/file.helper';

@Injectable()
export class MenuService {
  constructor(private readonly prismaService: PrismaService) {}

  async createMenu(req: CreateMenuDto, file: Express.Multer.File) {
    const { name, menuType, stock } = req;
    const imageName = file.filename;

    const menuData: Prisma.MenuCreateInput = {
      name,
      menuType,
      stock,
      imageName,
    };

    return await this.prismaService.menu.create({
      data: menuData,
      omit: {
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getMenuList(req: GetMenuListDto) {
    const { page, take, menuType, search } = req;

    const where: Prisma.MenuWhereInput = {};

    if (menuType) {
      where.menuType = menuType;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const skip = getSkipValue(page, take);

    const result = await this.prismaService.menu.findMany({
      where,
      skip,
      take,
      orderBy: {
        name: 'asc',
      },
      omit: {
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalItems = await this.prismaService.menu.count({
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

  async updateMenu(id: number, req: UpdateMenuDto, file?: Express.Multer.File) {
    const { name, menuType, stock } = req;
    const newImageName = file?.filename;

    const imageDir = getImageDirectory();
    let imagePath: string;

    const menu = await this.prismaService.menu.findUnique({
      where: {
        id,
      },
      select: {
        imageName: true,
      },
    });

    if (!menu) {
      if (newImageName) {
        imagePath = join(imageDir, newImageName);
        safeUnlink(imagePath);
      }

      throw new NotFoundException(`Menu with id ${id} is not found.`);
    }

    const menuData: Prisma.MenuUpdateInput = {
      name,
      menuType,
      stock,
      imageName: newImageName,
    };

    const updated = await this.prismaService.menu.update({
      where: {
        id,
      },
      data: menuData,
      omit: {
        createdAt: true,
        updatedAt: true,
      },
    });

    if (menu.imageName && newImageName) {
      imagePath = join(imageDir, menu.imageName);
      safeUnlink(imagePath);
    }

    return updated;
  }

  async deleteMenu(id: number) {
    const menu = await this.prismaService.menu.findUnique({
      where: {
        id,
      },
      select: {
        imageName: true,
      },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with id ${id} is not found.`);
    }

    const deleted = await this.prismaService.menu.delete({
      where: {
        id,
      },
      omit: {
        createdAt: true,
        updatedAt: true,
      },
    });

    const imagePath = join(getImageDirectory(), menu.imageName);
    safeUnlink(imagePath);

    return deleted;
  }
}
