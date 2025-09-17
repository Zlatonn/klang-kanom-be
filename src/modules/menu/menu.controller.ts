import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dtos/create-menu.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetMenuListDto } from './dtos/get-menu-list.dto';
import { UpdateMenuDto } from './dtos/update-menu.dto';

@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  createMenu(
    @Body() req: CreateMenuDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.menuService.createMenu(req, file);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get('list')
  getMenuList(@Query() req: GetMenuListDto) {
    return this.menuService.getMenuList(req);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  updateMenu(
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdateMenuDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.menuService.updateMenu(id, req, file);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  deleteMenu(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.deleteMenu(id);
  }
}
