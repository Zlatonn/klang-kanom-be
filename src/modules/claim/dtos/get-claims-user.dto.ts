import { MenuType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { getEndDate, getStartDate } from 'src/utils/helpers/date.helper';

export class GetClaimsUserDto {
  @IsNotEmpty()
  @Transform(({ value }) => getStartDate(value))
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @Transform(({ value }) => getEndDate(value))
  @IsDate()
  endDate: Date;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  take: number;

  @IsOptional()
  @IsEnum(MenuType)
  menuType?: MenuType;

  @IsOptional()
  @IsString()
  search?: string;
}
