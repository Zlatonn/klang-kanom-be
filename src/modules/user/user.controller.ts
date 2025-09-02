import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { User } from 'src/utils/decorators/user.decorator';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { Role } from '@prisma/client';
import { GetListUserDto } from './dtos/get-list-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.ADMIN)
  @Get('list')
  getListUser(@Query() req: GetListUserDto) {
    return this.userService.getListUser(req);
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }

  @Roles(Role.ADMIN)
  @Post('create')
  createUser(@Body() req: CreateUserDto) {
    return this.userService.createUser(req);
  }

  @Roles(Role.ADMIN)
  @Patch('update/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, req);
  }

  @Roles(Role.ADMIN)
  @Delete('delete/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }

  @Roles(Role.ADMIN)
  @Patch('reset-password/:id')
  resetPassword(@Param('id', ParseIntPipe) id: number) {
    return this.userService.resetPassword(id);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Patch('change-password')
  changePassword(@User('id') id: number, @Body() req: ChangePasswordDto) {
    return this.userService.changePassword(id, req);
  }
}
