import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ClaimService } from './claim.service';
import { CreateClaimsDto } from './dtos/create-claims.dto';
import { GetClaimsDto } from './dtos/get-claims.dto';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { User } from 'src/utils/decorators/user.decorator';
import { GetClaimsTopDto } from './dtos/get-claims-top.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GetClaimsDashboardPositionDto } from './dtos/get-claims-dashboard-department';

@ApiBearerAuth()
@Controller('claims')
export class ClaimController {
  constructor(private readonly claimService: ClaimService) {}

  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Create claim' })
  @Post()
  createClaims(@User('id') id: number, @Body() req: CreateClaimsDto) {
    return this.claimService.createClaims(id, req);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List claims' })
  @Get()
  getClaims(@Query() req: GetClaimsDto) {
    return this.claimService.getClaims(req);
  }

  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Top users by claims' })
  @Get('top-user')
  getClaimsTopUser(@Query() req: GetClaimsTopDto) {
    return this.claimService.getClaimsTopUser(req);
  }

  @Roles(Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Top menus by claims' })
  @Get('top-menu')
  getClaimsTopMenu(@Query() req: GetClaimsTopDto) {
    return this.claimService.getClaimsTopMenu(req);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Dashboard claims by department' })
  @Get('dashboard/position')
  getClaimsDashboardByPosition(@Query() req: GetClaimsDashboardPositionDto) {
    return this.claimService.getClaimsDashboardByPosition(req);
  }
}
