import { ApiProperty } from '@nestjs/swagger';
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
import {
  formatDateYYYYMMDD,
  getEndDate,
  getStartDate,
} from 'src/utils/helpers/date.helper';

export class GetUserClaimsDto {
  @ApiProperty({ required: true, example: formatDateYYYYMMDD(new Date()) })
  @IsNotEmpty()
  @Transform(({ value }) => getStartDate(value))
  @IsDate()
  startDate: Date;

  @ApiProperty({ required: true, example: formatDateYYYYMMDD(new Date()) })
  @IsNotEmpty()
  @Transform(({ value }) => getEndDate(value))
  @IsDate()
  endDate: Date;

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
