import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from 'class-validator';
import {
  formatDateYYYYMMDD,
  getEndDate,
  getStartDate,
} from 'src/utils/helpers/date.helper';

export class GetClaimsTopDto {
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

  @ApiProperty({ required: false, example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  take?: number;
}
