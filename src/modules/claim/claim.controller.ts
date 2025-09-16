import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ClaimService } from './claim.service';
import { CreateClaimDto } from './dtos/create-claim.dto';
import { GetListClaimDto } from './dtos/get-list-claim.dto';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetClaimByUserDto } from './dtos/get-claim-by-user.dto';
import { User } from 'src/utils/decorators/user.decorator';
import { GetTopClaimDto } from './dtos/get-top-claim.dto';

@Controller('claim')
export class ClaimController {
  constructor(private readonly claimService: ClaimService) {}

  @Roles(Role.ADMIN, Role.USER)
  @Post('create')
  createClaims(@User('id') id: number, @Body() req: CreateClaimDto) {
    return this.claimService.createClaims(id, req);
  }

  @Roles(Role.ADMIN)
  @Get('list')
  getListClaim(@Query() req: GetListClaimDto) {
    return this.claimService.getListClaim(req);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get('me')
  getClaimsByUserId(@User('id') id: number, @Query() req: GetClaimByUserDto) {
    return this.claimService.getClaimsByUser(id, req);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get('top-user')
  getTopClaimUser(@Query() req: GetTopClaimDto) {
    return this.claimService.getTopClaimUser(req);
  }

  @Roles(Role.ADMIN, Role.USER)
  @Get('top-menu')
  getTopClaimMenu(@Query() req: GetTopClaimDto) {
    return this.claimService.getTopClaimMenu(req);
  }
}
