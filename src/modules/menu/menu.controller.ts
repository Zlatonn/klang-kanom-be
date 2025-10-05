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
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';

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
  @Get()
  getMenus(@Query() req: GetMenusDto) {
    return this.menuService.getMenus(req);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateMenuDto,
  })
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
