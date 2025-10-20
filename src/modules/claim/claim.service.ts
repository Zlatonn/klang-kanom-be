import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClaimsDto } from './dtos/create-claims.dto';
import { Prisma } from '@prisma/client';
import { GetClaimsDto } from './dtos/get-claims.dto';
import {
  getSkipValue,
  getTotalPage,
} from 'src/utils/helpers/pagination.helper';
import { GetClaimsTopDto } from './dtos/get-claims-top.dto';
import { GetClaimsDashboardPositionDto } from './dtos/get-claims-dashboard-department';

@Injectable()
export class ClaimService {
  constructor(private readonly prismaService: PrismaService) {}

  async createClaims(id: number, req: CreateClaimsDto) {
    const { orders } = req;

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

  async getClaims(req: GetClaimsDto) {
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

  async getClaimsTopUser(req: GetClaimsTopDto) {
    const { startDate, endDate, take } = req;

    const onCondition = `AND claims.created_at BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'`;

    const limit = take ? `LIMIT ${take}` : ``;

    const queryRaw = `
      SELECT
        users.id,
        users.first_name AS "firstName",
        users.last_name AS "lastName",
        users.image_name AS "imageName",
        COALESCE(SUM(claims.quantity),0)::INT AS "totalClaims"
      FROM
        users
        LEFT JOIN claims
        ON users.id = claims.user_id ${onCondition}
      GROUP BY
        users.id,
        users.first_name,
        users.last_name
      ORDER BY 
        "totalClaim" DESC,
        users.first_name ASC,
        users.last_name ASC
      ${limit}
    `;

    return await this.prismaService.$queryRawUnsafe(queryRaw);
  }

  async getClaimsTopMenu(req: GetClaimsTopDto) {
    const { startDate, endDate, take } = req;

    const onCondition = `AND claims.created_at BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'`;

    const limit = take ? `LIMIT ${take}` : ``;

    const queryRaw = `
    SELECT 
      menus.id, 
      menus.name, 
      menus.image_name AS "imageName",
      COALESCE(SUM(claims.quantity),0)::INT AS "totalClaims"
    FROM
      menus
      LEFT JOIN claims
      ON menus.id = claims.menu_id ${onCondition}
    GROUP BY
      menus.id,
      menus.name,
      menus.image_name
    ORDER BY 
      "totalClaim" DESC,
      menus.name ASC
    ${limit}
    `;

    return await this.prismaService.$queryRawUnsafe(queryRaw);
  }

  async getClaimsDashboardByPosition(req: GetClaimsDashboardPositionDto) {
    const { startDate, endDate } = req;

    const onCondition = `AND claims.created_at BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'`;

    const queryRaw = `
    SELECT
      pg_enum.enumlabel AS "position",
      COALESCE(SUM(claims.quantity) FILTER (WHERE menus.menu_type = 'SNACK'),0)::INT AS "totalClaimsSnack",
      COALESCE(SUM(claims.quantity) FILTER (WHERE menus.menu_type = 'FOOD'),0)::INT AS "totalClaimsFood",
      COALESCE(SUM(claims.quantity) FILTER (WHERE menus.menu_type = 'DRINK'),0)::INT AS "totalClaimsDrink",
      COALESCE(SUM(claims.quantity), 0)::INT AS "totalClaimsAll"
    FROM
      pg_enum
      INNER JOIN pg_type 
      ON pg_type.oid = pg_enum.enumtypid
      AND pg_type.typname = 'Position'
      LEFT JOIN users 
      ON users.position::TEXT = pg_enum.enumlabel::TEXT
      LEFT JOIN claims 
      ON users.id = claims.user_id ${onCondition}  
      LEFT JOIN menus 
      ON claims.menu_id = menus.id 
    GROUP BY
      pg_enum.enumlabel
    ORDER BY
      "totalClaimsAll" DESC,
      "position" ASC
    `;

    return await this.prismaService.$queryRawUnsafe(queryRaw);
  }
}
