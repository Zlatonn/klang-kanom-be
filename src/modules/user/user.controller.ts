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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'List users' })
  getUsers(@Query() req: GetUsersDto) {
    return this.userService.getUsers(req);
  }

  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Get my profile' })
  @Get('me')
  getUserProfile(@User('id') id: number) {
    return this.userService.getUserProfile(id);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get user by id' })
  @Get(':id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUser(id);
  }

  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'List my claims' })
  @Get('me/claims')
  getUserClaims(@User('id') id: number, @Query() req: GetUserClaimsDto) {
    return this.userService.getUserClaims(id, req);
  }

  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Update my profile' })
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
  @ApiOperation({ summary: 'Update user by id' })
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
  @ApiOperation({ summary: 'Change my password' })
  @Patch('me/change-password')
  changePassword(@User('id') id: number, @Body() req: ChangePasswordDto) {
    return this.userService.changePassword(id, req);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  resetPassword(@Param('id', ParseIntPipe) id: number) {
    return this.userService.resetPassword(id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by id' })
  deleteUser(
    @User('id') ownId: number,
    @Param('id', ParseIntPipe) targetId: number,
  ) {
    return this.userService.deleteUser(ownId, targetId);
  }
}
