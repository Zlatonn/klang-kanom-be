import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dtos/create-menu.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Roles(Role.ADMIN)
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

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
}
