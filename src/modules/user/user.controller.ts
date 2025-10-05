import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { User } from 'src/utils/decorators/user.decorator';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { Role } from '@prisma/client';
import { GetUsersDto } from './dtos/get-users.dto';
import { UpdateUserProfileDto } from './dtos/update-user-profile.dto';
import { GetUserClaimsDto } from './dtos/get-user-claims.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.ADMIN)
  @Get()
  getUsers(@Query() req: GetUsersDto) {
    return this.userService.getUsers(req);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get('me')
  getUserProfile(@User('id') id: number) {
    return this.userService.getUserProfile(id);
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUser(id);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get('me/claims')
  getUserClaims(@User('id') id: number, @Query() req: GetUserClaimsDto) {
    return this.userService.getUserClaims(id, req);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Patch('me')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateUserProfileDto,
  })
  updateUserProfile(
    @User('id') id: number,
    @Body() req: UpdateUserProfileDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.userService.updateUserProfile(id, req, file);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateUserDto,
  })
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() req: UpdateUserDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.userService.updateUser(id, req, file);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Patch('me/change-password')
  changePassword(@User('id') id: number, @Body() req: ChangePasswordDto) {
    return this.userService.changePassword(id, req);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/reset-password')
  resetPassword(@Param('id', ParseIntPipe) id: number) {
    return this.userService.resetPassword(id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
