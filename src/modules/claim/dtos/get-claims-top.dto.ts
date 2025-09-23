import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { getEndDate, getStartDate } from 'src/utils/helpers/date.helper';

export class GetClaimsTopDto {
  @IsNotEmpty()
  @Transform(({ value }) => getStartDate(value))
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @Transform(({ value }) => getEndDate(value))
  @IsDate()
  endDate: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  take?: number;
}
