import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dtos/create-menu.dto';
import { Prisma } from '@prisma/client';

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

    return this.prismaService.menu.create({
      data: menuData,
      omit: {
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
