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
import { GetMenusDto } from './dtos/get-menus.dto';
import { UpdateMenuDto } from './dtos/update-menu.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateMenuDto,
  })
  @ApiOperation({ summary: 'Create menu item' })
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
  @ApiOperation({ summary: 'List menus' })
  @Get()
  getMenus(@Query() req: GetMenusDto) {
    return this.menuService.getMenus(req);
  }

  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Get menu by id' })
  @Get(':id')
  getMenu(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.getMenu(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateMenuDto,
  })
  @ApiOperation({ summary: 'Update menu item' })
  updateMenu(
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdateMenuDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.menuService.updateMenu(id, req, file);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete menu item' })
  @Delete(':id')
  deleteMenu(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.deleteMenu(id);
  }
}
