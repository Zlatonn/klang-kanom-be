import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClaimDto } from './dtos/create-claim.dto';
import { Prisma } from '@prisma/client';
import { GetListClaimDto } from './dtos/get-list-claim.dto';
import {
  getSkipValue,
  getTotalPage,
} from 'src/utils/helpers/pagination.helper';
import { GetClaimByUserDto } from './dtos/get-claim-by-user.dto';
import { GetTopClaimDto } from './dtos/get-top-claim.dto';

@Injectable()
export class ClaimService {
  constructor(private readonly prismaService: PrismaService) {}

  async createClaims(id: number, req: CreateClaimDto) {
    const { orders } = req;

    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} is not found.`);
    }

    const menus = await this.prismaService.menu.findMany({
      where: {
        id: {
          in: orders.map((order) => order.menuId),
        },
      },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    if (menus.length !== orders.length) {
      throw new NotFoundException('Some menu could not be found.');
    }

    const isStockEnough = menus.every((menu) => {
      const pendingOrder = orders.find((order) => order.menuId === menu.id);
      if (!pendingOrder) return false;
      return menu.stock >= pendingOrder.quantity;
    });

    if (!isStockEnough) {
      throw new BadRequestException(
        'Some menu does not have enough stock for claim.',
      );
    }

    const claimsData: Prisma.ClaimCreateManyInput[] = orders.map((order) => {
      return {
        quantity: order.quantity,
        userId: id,
        menuId: order.menuId,
      };
    });

    const createClaimsTask = this.prismaService.claim.createManyAndReturn({
      data: claimsData,
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        Menu: {
          select: {
            id: true,
            name: true,
            menuType: true,
          },
        },
      },
      omit: {
        updatedAt: true,
        userId: true,
        menuId: true,
      },
    });

    const updateStockTasks = orders.map((order) => {
      return this.prismaService.menu.update({
        where: {
          id: order.menuId,
        },
        data: {
          stock: {
            decrement: order.quantity,
          },
        },
      });
    });

    const result = await this.prismaService.$transaction([
      createClaimsTask,
      ...updateStockTasks,
    ]);

    return result[0];
  }

  async getListClaim(req: GetListClaimDto) {
    const { startDate, endDate, page, take, search, menuType } = req;

    const where: Prisma.ClaimWhereInput = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (menuType) {
      where.Menu = {
        menuType: menuType,
      };
    }

    if (search) {
      where.OR = [
        {
          User: {
            firstName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          User: {
            lastName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          Menu: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    const skip = getSkipValue(page, take);

    const result = await this.prismaService.claim.findMany({
      where,
      skip,
      take,
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        Menu: {
          select: {
            id: true,
            name: true,
            menuType: true,
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

  async getClaimsByUser(id: number, req: GetClaimByUserDto) {
    const { startDate, endDate, page, take, search, menuType } = req;

    const where: Prisma.ClaimWhereInput = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      User: { id },
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

  async getTopClaimUser(req: GetTopClaimDto) {
    const { take } = req;

    const limit = take ? `LIMIT ${take}` : ``;

    const queryRaw = `
      SELECT
        users.id,
        users.first_name,
        users.last_name,
        COALESCE(SUM(claims.quantity),0)::INT AS "totalClaim"
      FROM users
      LEFT JOIN claims ON users.id = claims.user_id
      GROUP BY
        users.id,
        users.first_name,
        users.last_name
      ORDER BY "totalClaim" DESC
      ${limit}
    `;

    return await this.prismaService.$queryRawUnsafe(queryRaw);
  }

  async getTopClaimMenu(req: GetTopClaimDto) {
    const { take } = req;

    const limit = take ? `LIMIT ${take}` : ``;

    const queryRaw = `
    SELECT 
      menus.id, 
      menus.name, 
      menus.image_name,
      COALESCE(SUM(claims.quantity),0)::INT AS "totalClaim"
    FROM menus
    LEFT JOIN claims ON menus.id = claims.menu_id
    GROUP BY
      menus.id,
      menus.name,
      menus.image_name
    ORDER BY "totalClaim" DESC
    ${limit}
    `;

    return await this.prismaService.$queryRawUnsafe(queryRaw);
  }
}
