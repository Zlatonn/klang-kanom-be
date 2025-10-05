import { ApiProperty } from '@nestjs/swagger';
import { MenuType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class GetMenusDto {
  @ApiProperty({ required: true, example: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page: number;

  @ApiProperty({ required: true, example: 10 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  take: number;

  @ApiProperty({ required: false, enum: MenuType })
  @IsOptional()
  @IsEnum(MenuType)
  menuType?: MenuType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
