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
import { GetListMenuDto } from './dtos/get-list-menu.dto';
import { UpdateMenuDto } from './dtos/update-menu.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Roles(Role.ADMIN, Role.USER)
  @Get('list')
  getListMenu(@Query() req: GetListMenuDto) {
    return this.menuService.getListMenu(req);
  }

  @Roles(Role.ADMIN)
  @Post('create')
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

  @Roles(Role.ADMIN)
  @Patch('update/:id')
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
  @Delete('delete/:id')
  deleteMenu(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.deleteMenu(id);
  }
}
